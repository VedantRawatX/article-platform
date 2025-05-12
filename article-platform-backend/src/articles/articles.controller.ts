    // src/articles/articles.controller.ts
    import {
      Controller,
      Get,
      Post,
      Body,
      Patch,
      Param,
      Delete,
      ParseUUIDPipe,
      HttpCode,
      HttpStatus,
      Query,
      UseGuards,
      Request,
      Injectable,
      ValidationPipe,
      Logger, // Import Logger
    } from '@nestjs/common';
    import { ArticlesService, ArticleResponse, PaginatedArticlesResponse, SortableArticleFields, SortDirection } from './articles.service';
    import { CreateArticleDto } from './dto/create-article.dto';
    import { UpdateArticleDto } from './dto/update-article.dto';
    import {
      ApiTags,
      ApiOperation,
      ApiResponse,
      ApiParam,
      ApiBody,
      ApiQuery,
      ApiBearerAuth,
      ApiProperty
    } from '@nestjs/swagger';
    import { Article } from './entities/article.entity';
    import { ArticleCategory } from './entities/article-category.enum';
    import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
    import { Roles } from '../auth/decorators/roles.decorator';
    import { UserRole } from '../users/entities/user.entity';
    import { RolesGuard } from '../auth/guards/roles.guard';
    import { IsOptional, IsString, IsEnum, IsIn, IsInt, Min, Max } from 'class-validator';
    import { Type } from 'class-transformer';

    // DTO for query parameters to enable validation and transformation
    class GetArticlesQueryDto {
      @ApiProperty({ required: false, description: 'Page number', example: 1, default: 1, type: Number })
      @Type(() => Number)
      @IsOptional()
      @IsInt({ message: 'Page must be an integer.' })
      @Min(1, { message: 'Page must be at least 1.' })
      page?: number = 1;

      @ApiProperty({ required: false, description: 'Items per page', example: 10, default: 10, type: Number })
      @Type(() => Number)
      @IsOptional()
      @IsInt({ message: 'Limit must be an integer.' })
      @Min(1, { message: 'Limit must be at least 1.' })
      @Max(100, { message: 'Limit cannot exceed 100.' })
      limit?: number = 10;

      @ApiProperty({ required: false, description: 'Keyword to search in title and body' })
      @IsOptional()
      @IsString()
      search?: string;

      @ApiProperty({ required: false, description: 'Filter by category', enum: ArticleCategory })
      @IsOptional()
      @IsEnum(ArticleCategory, { message: 'Invalid category provided.'})
      category?: ArticleCategory;

      @ApiProperty({ required: false, description: 'Comma-separated tags to filter by' })
      @IsOptional()
      @IsString()
      tags?: string;

      @ApiProperty({ required: false, description: 'Field to sort by', enum: ['createdAt', 'title', 'likes', 'updatedAt'], default: 'createdAt' })
      @IsOptional()
      @IsIn(['createdAt', 'title', 'likes', 'updatedAt'], { message: 'Invalid sortBy field.'})
      sortBy?: SortableArticleFields = 'createdAt';

      @ApiProperty({ required: false, description: 'Sort direction', enum: ['ASC', 'DESC'], default: 'DESC' })
      @IsOptional()
      @IsIn(['ASC', 'DESC'], { message: 'Invalid sortDirection. Must be ASC or DESC.'})
      sortDirection?: SortDirection = 'DESC';
    }

    class GetAdminArticlesQueryDto extends GetArticlesQueryDto {
        @ApiProperty({ required: false, description: 'Filter by published status (true, false, or all)', enum: ['true', 'false', 'all'], default: 'all' })
        @IsOptional() @IsIn(['true', 'false', 'all'])
        publishedStatus?: 'true' | 'false' | 'all' = 'all';
        @ApiProperty({ required: false, description: 'Field to sort by for admin', enum: ['createdAt', 'title', 'likes', 'updatedAt', 'category', 'isPublished'], default: 'createdAt' })
        @IsOptional() @IsIn(['createdAt', 'title', 'likes', 'updatedAt', 'category', 'isPublished'])
        sortBy?: SortableArticleFields = 'createdAt';
    }

    @Injectable()
    export class OptionalJwtAuthGuard extends JwtAuthGuard {
      handleRequest(err, user, info, context) { return user; }
    }

    @ApiTags('articles')
    @Controller('articles')
    export class ArticlesController {
      private readonly logger = new Logger(ArticlesController.name); // Instantiate logger

      constructor(private readonly articlesService: ArticlesService) {}

      @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @Post() @HttpCode(HttpStatus.CREATED) @ApiBearerAuth() @ApiOperation({ summary: 'Create a new article (Admin)' }) @ApiBody({ type: CreateArticleDto }) @ApiResponse({ status: HttpStatus.CREATED, description: 'Article created.', type: Article })
      async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> { return this.articlesService.create(createArticleDto); }

      @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @Get('all') @ApiBearerAuth() @ApiOperation({ summary: 'Get all articles including drafts (Admin, Paginated, Filterable, Sortable)' }) /* ApiQuery decorators... */ @ApiResponse({ status: HttpStatus.OK, description: 'Paginated list of all articles.' })
      async findAllAdmin(@Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) query: GetAdminArticlesQueryDto): Promise<PaginatedArticlesResponse> {
        this.logger.debug(`Admin findAllAdmin - Query DTO received: ${JSON.stringify(query)}`);
        const { page, limit, search, category, tags, publishedStatus, sortBy, sortDirection } = query;
        return this.articlesService.findAll(page, limit, search, category, tags, publishedStatus, sortBy, sortDirection);
      }

      @Get() @ApiOperation({ summary: 'Get all published articles (Public, Paginated, Filterable, Sortable)' }) /* ApiQuery decorators... */ @ApiResponse({ status: HttpStatus.OK, description: 'Paginated, filtered, and sorted list of published articles.' })
      async findAllPublished(
        @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) query: GetArticlesQueryDto,
        @Request() req: any,
      ): Promise<PaginatedArticlesResponse> {
        this.logger.debug(`Public findAllPublished - Query DTO received: ${JSON.stringify(query)}`); // Log the received query DTO
        const { page, limit, search, category, tags, sortBy, sortDirection } = query;
        const userId = req.user?.id;
        return this.articlesService.findAllPublished(page, limit, search, category, tags, sortBy, sortDirection, userId);
      }

      @UseGuards(OptionalJwtAuthGuard) @Get(':id') @ApiOperation({ summary: 'Get an article by ID' }) @ApiParam({ name: 'id', description: 'UUID of the article', type: String, format: 'uuid' }) @ApiResponse({ status: HttpStatus.OK, description: 'The requested article.'})
      async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<ArticleResponse> {
        const userId = req.user?.id;
        return this.articlesService.findOne(id, userId);
      }

      @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @Patch(':id') @ApiBearerAuth() @ApiOperation({ summary: 'Update an article (Admin)' }) @ApiParam({ name: 'id', type: String, format: 'uuid' }) @ApiBody({ type: UpdateArticleDto }) @ApiResponse({ status: HttpStatus.OK, description: 'Article updated.', type: Article })
      async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateArticleDto: UpdateArticleDto): Promise<Article> { return this.articlesService.update(id, updateArticleDto); }

      @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiBearerAuth() @ApiOperation({ summary: 'Delete an article (Admin)' }) @ApiParam({ name: 'id', type: String, format: 'uuid' }) @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Article deleted.' })
      async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> { return this.articlesService.remove(id); }

      @UseGuards(JwtAuthGuard) @Post(':id/like') @HttpCode(HttpStatus.OK) @ApiBearerAuth() @ApiOperation({ summary: 'Like or Unlike an article' }) @ApiParam({ name: 'id', type: String, format: 'uuid' }) @ApiResponse({ status: HttpStatus.OK, description: 'Article like status updated.'})
      async toggleLikeArticle(@Param('id', ParseUUIDPipe) articleId: string, @Request() req: any): Promise<ArticleResponse> {
        const userId = req.user.id;
        return this.articlesService.toggleLike(articleId, userId);
      }

      @UseGuards(JwtAuthGuard) @Post(':id/save') @HttpCode(HttpStatus.OK) @ApiBearerAuth() @ApiOperation({ summary: 'Save or Unsave an article for the current user' }) @ApiParam({ name: 'id', description: 'UUID of the article to save/unsave', type: String, format: 'uuid' }) @ApiResponse({ status: HttpStatus.OK, description: 'Article save status updated.'})
      async toggleSaveArticle(@Param('id', ParseUUIDPipe) articleId: string, @Request() req: any): Promise<ArticleResponse> {
        const userId = req.user.id;
        return this.articlesService.toggleSaveArticle(articleId, userId);
      }

      @UseGuards(JwtAuthGuard) @Get('user/saved') @ApiBearerAuth() @ApiOperation({ summary: 'Get all articles saved by the current user (Paginated)' }) @ApiQuery({ name: 'page', required: false, type: Number }) @ApiQuery({ name: 'limit', required: false, type: Number }) @ApiResponse({ status: HttpStatus.OK, description: 'Paginated list of saved articles.' })
      async getSavedArticles(@Request() req: any, @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) query: Pick<GetArticlesQueryDto, 'page' | 'limit'>): Promise<PaginatedArticlesResponse> {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = query;
        return this.articlesService.findSavedArticlesByUser(userId, page, limit);
      }
    }
    