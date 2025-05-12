    // src/articles/articles.module.ts
    import { Module } from '@nestjs/common';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { Article } from './entities/article.entity';
    import { UserArticleLike } from './entities/user-article-like.entity';
    import { UserSavedArticle } from './entities/user-saved-article.entity'; // Import new entity
    import { ArticlesService } from './articles.service';
    import { ArticlesController } from './articles.controller';

    @Module({
      imports: [
        TypeOrmModule.forFeature([Article, UserArticleLike, UserSavedArticle]), // Add UserSavedArticle here
        // UsersModule,
      ],
      controllers: [ArticlesController],
      providers: [ArticlesService],
      exports: [ArticlesService, TypeOrmModule],
    })
    export class ArticlesModule {}
    