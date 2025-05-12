    // src/articles/articles.service.ts
    import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository, FindManyOptions, FindOneOptions, ILike, In, Brackets } from 'typeorm';
    import { Article } from './entities/article.entity';
    import { UserArticleLike } from './entities/user-article-like.entity';
    import { UserSavedArticle } from './entities/user-saved-article.entity';
    import { CreateArticleDto } from './dto/create-article.dto';
    import { UpdateArticleDto } from './dto/update-article.dto';
    import { ArticleCategory } from './entities/article-category.enum';

    export type ArticleResponse = Article & { currentUserHasLiked?: boolean; currentUserHasSaved?: boolean };

    export interface PaginatedArticlesResponse {
      data: ArticleResponse[] | Article[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }

    export type SortableArticleFields = 'createdAt' | 'title' | 'likes' | 'updatedAt' | 'category' | 'isPublished';
    export type SortDirection = 'ASC' | 'DESC';
    export type PublishedStatusFilter = 'true' | 'false' | 'all';


    @Injectable()
    export class ArticlesService {
      private readonly logger = new Logger(ArticlesService.name);

      constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(UserArticleLike)
        private readonly userArticleLikeRepository: Repository<UserArticleLike>,
        @InjectRepository(UserSavedArticle)
        private readonly userSavedArticleRepository: Repository<UserSavedArticle>,
      ) {}

      async create(createArticleDto: CreateArticleDto): Promise<Article> {
        try {
          const newArticle = this.articleRepository.create(createArticleDto);
          return await this.articleRepository.save(newArticle);
        } catch (error) {
          this.logger.error(`Error creating article: ${error.message}`, error.stack);
          if (error.code === '23505') { // PostgreSQL unique violation
            throw new ConflictException('Article with this title might already exist or other unique constraint failed.');
          }
          throw new InternalServerErrorException('Could not create article.');
        }
      }

      // Method to find an article by title (for seeder optimization)
      async findByTitle(title: string): Promise<Article | null> {
        return this.articleRepository.findOne({ where: { title } });
      }

      async findAll(
        page = 1, limit = 10, searchKeyword?: string, filterCategory?: ArticleCategory,
        filterTags?: string, filterPublishedStatus: PublishedStatusFilter = 'all',
        sortBy: SortableArticleFields = 'createdAt', sortDirection: SortDirection = 'DESC',
      ): Promise<PaginatedArticlesResponse> {
        // ... (findAll method for admin - logic remains the same)
        try {
          const skip = (page - 1) * limit;
          const queryBuilder = this.articleRepository.createQueryBuilder('article');
          if (filterPublishedStatus === 'true') { queryBuilder.where('article.isPublished = :isPublished', { isPublished: true }); }
          else if (filterPublishedStatus === 'false') { queryBuilder.where('article.isPublished = :isPublished', { isPublished: false }); }
          if (searchKeyword) {
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where('article.title ILIKE :searchKeyword', { searchKeyword: `%${searchKeyword}%` })
                  .orWhere('article.body ILIKE :searchKeyword', { searchKeyword: `%${searchKeyword}%` });
            }));
          }
          if (filterCategory) { queryBuilder.andWhere('article.category = :filterCategory', { filterCategory }); }
          if (filterTags) {
            const tagsArray = filterTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tagsArray.length > 0) { queryBuilder.andWhere('article.tags && ARRAY[:...tagsArray]', { tagsArray });}
          }
          const allowedSortFields: SortableArticleFields[] = ['createdAt', 'title', 'likes', 'updatedAt', 'category', 'isPublished'];
          if (!allowedSortFields.includes(sortBy)) { sortBy = 'createdAt'; }
          const validSortDirection = (sortDirection.toUpperCase() === 'ASC' || sortDirection.toUpperCase() === 'DESC') ? sortDirection.toUpperCase() : 'DESC';
          queryBuilder.orderBy(`article.${sortBy}`, validSortDirection as 'ASC' | 'DESC').skip(skip).take(limit);
          const [articles, total] = await queryBuilder.getManyAndCount();
          return { data: articles, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit)};
        } catch (error) {
          this.logger.error('Error fetching all articles for admin with filters:', error.stack);
          throw new InternalServerErrorException('Could not fetch articles for admin.');
        }
      }

      async findAllPublished(
        page = 1, limit = 10, searchKeyword?: string, filterCategory?: ArticleCategory,
        filterTags?: string, sortBy: SortableArticleFields = 'createdAt', sortDirection: SortDirection = 'DESC',
        userId?: string
      ): Promise<PaginatedArticlesResponse> {
        // ... (findAllPublished method - logic remains the same)
        try {
          const skip = (page - 1) * limit;
          const queryBuilder = this.articleRepository.createQueryBuilder('article');
          queryBuilder.where('article.isPublished = :isPublished', { isPublished: true });

          if (searchKeyword) {
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where('article.title ILIKE :searchKeyword', { searchKeyword: `%${searchKeyword}%` })
                  .orWhere('article.body ILIKE :searchKeyword', { searchKeyword: `%${searchKeyword}%` });
            }));
          }
          if (filterCategory) { queryBuilder.andWhere('article.category = :filterCategory', { filterCategory });}
          if (filterTags) {
            const tagsArray = filterTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tagsArray.length > 0) { queryBuilder.andWhere('article.tags && ARRAY[:...tagsArray]', { tagsArray });}
          }
          const allowedSortFields: SortableArticleFields[] = ['createdAt', 'title', 'likes', 'updatedAt', 'category'];
          let validSortBy = sortBy;
          if (!allowedSortFields.includes(sortBy)) { validSortBy = 'createdAt'; }
          const validSortDirection = (sortDirection.toUpperCase() === 'ASC' || sortDirection.toUpperCase() === 'DESC') ? sortDirection.toUpperCase() : 'DESC';
          queryBuilder.orderBy(`article.${validSortBy}`, validSortDirection as 'ASC' | 'DESC').skip(skip).take(limit);
          const [articles, total] = await queryBuilder.getManyAndCount();
          const augmentedArticles = await Promise.all(
            articles.map(async (article) => {
              const responseArticle: ArticleResponse = { ...article, currentUserHasLiked: false, currentUserHasSaved: false };
              if (userId) {
                const like = await this.userArticleLikeRepository.findOne({ where: { article: { id: article.id }, user: { id: userId } } });
                responseArticle.currentUserHasLiked = !!like;
                const saved = await this.userSavedArticleRepository.findOne({ where: { article: { id: article.id }, user: { id: userId } } });
                responseArticle.currentUserHasSaved = !!saved;
              }
              return responseArticle;
            })
          );
          return { data: augmentedArticles, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit)};
        } catch (error) {
          this.logger.error('Error fetching published articles with filters:', error.stack);
          throw new InternalServerErrorException('Could not fetch published articles.');
        }
      }

      async findOne(id: string, userId?: string): Promise<ArticleResponse> {
        // ... (findOne method - logic remains the same)
        if (!id) { throw new NotFoundException(`Article ID cannot be empty.`); }
        const article = await this.articleRepository.findOne({ where: { id } });
        if (!article) { throw new NotFoundException(`Article with ID "${id}" not found.`); }
        const responseArticle: ArticleResponse = { ...article, currentUserHasLiked: false, currentUserHasSaved: false };
        if (userId) {
          const like = await this.userArticleLikeRepository.findOne({ where: { article: { id: article.id }, user: { id: userId } } });
          responseArticle.currentUserHasLiked = !!like;
          const saved = await this.userSavedArticleRepository.findOne({ where: { article: { id: article.id }, user: { id: userId } } });
          responseArticle.currentUserHasSaved = !!saved;
        }
        return responseArticle;
      }

      async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
        // ... (update method - logic remains the same)
        const article = await this.articleRepository.preload({ id: id, ...updateArticleDto });
        if (!article) { throw new NotFoundException(`Article with ID "${id}" not found.`); }
        try { return await this.articleRepository.save(article); }
        catch (error) {
          this.logger.error(`Error updating article with ID "${id}": ${error.message}`, error.stack);
          if (error.code === '23505') { throw new ConflictException('Update failed due to a unique constraint.');}
          throw new InternalServerErrorException('Could not update article.');
        }
      }

      async remove(id: string): Promise<void> {
        // ... (remove method - logic remains the same)
        const article = await this.findOne(id);
        if (!article) { throw new NotFoundException(`Article with ID "${id}" not found.`); }
        try {
            const result = await this.articleRepository.delete(id);
            if (result.affected === 0) { throw new NotFoundException(`Article with ID "${id}" not found during delete.`); }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error deleting article with ID "${id}": ${error.message}`, error.stack);
            throw new InternalServerErrorException('Could not delete article.');
        }
      }

      async toggleLike(articleId: string, userId: string): Promise<ArticleResponse> {
        // ... (toggleLike method - logic remains the same)
        const article = await this.articleRepository.findOneBy({id: articleId});
        if (!article) { throw new NotFoundException(`Article with ID "${articleId}" not found.`); }
        const existingLike = await this.userArticleLikeRepository.findOne({ where: { user: { id: userId }, article: { id: articleId } } });
        try {
          if (existingLike) {
            await this.userArticleLikeRepository.remove(existingLike);
            article.likes = Math.max(0, article.likes - 1);
          } else {
            const newLike = this.userArticleLikeRepository.create({ userId, articleId });
            await this.userArticleLikeRepository.save(newLike);
            article.likes += 1;
          }
          const savedArticleEntity = await this.articleRepository.save(article);
          return this.findOne(savedArticleEntity.id, userId); // Re-fetch to get full response
        } catch (error) {
            this.logger.error(`Error toggling like for article ${articleId} by user ${userId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Could not update like status.');
        }
      }

      async toggleSaveArticle(articleId: string, userId: string): Promise<ArticleResponse> {
        // ... (toggleSaveArticle method - logic remains the same)
        const article = await this.articleRepository.findOneBy({id: articleId});
        if (!article) { throw new NotFoundException(`Article with ID "${articleId}" not found.`); }
        const existingSave = await this.userSavedArticleRepository.findOne({ where: { user: { id: userId }, article: { id: articleId } } });
        try {
          if (existingSave) {
            await this.userSavedArticleRepository.remove(existingSave);
          } else {
            const newSave = this.userSavedArticleRepository.create({ userId, articleId });
            await this.userSavedArticleRepository.save(newSave);
          }
          return this.findOne(article.id, userId); // Re-fetch to get full response
        } catch (error) {
          this.logger.error(`Error toggling save for article ${articleId} by user ${userId}: ${error.message}`, error.stack);
          throw new InternalServerErrorException('Could not update article save status.');
        }
      }

      async findSavedArticlesByUser(userId: string, page: number, limit: number): Promise<PaginatedArticlesResponse> {
        // ... (findSavedArticlesByUser method - logic remains the same)
        const skip = (page - 1) * limit;
        const [savedEntries, total] = await this.userSavedArticleRepository.findAndCount({
          where: { user: { id: userId } }, relations: ['article'], order: { savedAt: 'DESC' }, skip: skip, take: limit,
        });
        const articles = savedEntries.map(savedEntry => savedEntry.article);
        const augmentedArticles = await Promise.all(
            articles.map(async (article) => {
              const responseArticle: ArticleResponse = { ...article, currentUserHasLiked: false, currentUserHasSaved: true };
              const like = await this.userArticleLikeRepository.findOne({ where: { article: { id: article.id }, user: { id: userId } } });
              responseArticle.currentUserHasLiked = !!like;
              return responseArticle;
            })
          );
        return { data: augmentedArticles, total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit)};
      }
    }
    