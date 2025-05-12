    // src/articles/entities/article.entity.ts
    import { ApiProperty } from '@nestjs/swagger';
    import {
      PrimaryGeneratedColumn,
      Column,
      CreateDateColumn,
      UpdateDateColumn,
      Entity,
      Index,
    } from 'typeorm';
    import { ArticleCategory } from './article-category.enum'; // Import the enum

    @Entity('articles')
    export class Article {
      @ApiProperty({
        description: 'The unique identifier of the article.',
        example: 'clqj4zsdc0000m801z1y2z3x4',
        readOnly: true,
      })
      @PrimaryGeneratedColumn('uuid')
      id: string;

      @ApiProperty({
        description: 'The title of the article.',
        example: 'Understanding NestJS Modules',
        maxLength: 255,
      })
      @Index()
      @Column({ type: 'varchar', length: 255 })
      title: string;

      @ApiProperty({
        description: 'The main content/body of the article.',
        example: 'NestJS modules are a powerful way to organize your application...',
      })
      @Column({ type: 'text' })
      body: string;

      @ApiProperty({
        description: 'URL of the cover image for the article.',
        example: 'https://example.com/images/nestjs-cover.jpg',
        required: false,
        nullable: true,
      })
      @Column({ type: 'varchar', length: 512, nullable: true })
      imageUrl?: string;

      @ApiProperty({
        description: 'The category of the article.',
        enum: ArticleCategory, // Use the enum for Swagger
        example: ArticleCategory.TECH,
      })
      @Index()
      @Column({
        type: 'enum',
        enum: ArticleCategory,
        default: ArticleCategory.GENERAL, // Optional: set a default category
      })
      category: ArticleCategory; // Type changed to ArticleCategory

      @ApiProperty({
        description: 'Tags associated with the article, stored as a comma-separated string or JSONB.',
        example: ['nestjs', 'typescript', 'backend'],
        type: [String],
      })
      @Index()
      @Column({ type: 'text', array: true, default: [] })
      tags: string[];


      @ApiProperty({
        description: 'The number of likes the article has received.',
        example: 150,
        default: 0,
      })
      @Column({ type: 'int', default: 0 })
      likes: number;

      @ApiProperty({
        description: 'Indicates if the article is a draft or published.',
        example: true,
        default: true,
      })
      @Column({ type: 'boolean', default: true })
      isPublished: boolean;


      @ApiProperty({
        description: 'The date and time when the article was created.',
        readOnly: true,
      })
      @CreateDateColumn({ type: 'timestamp with time zone' })
      createdAt: Date;

      @ApiProperty({
        description: 'The date and time when the article was last updated.',
        readOnly: true,
      })
      @UpdateDateColumn({ type: 'timestamp with time zone' })
      updatedAt: Date;
    }
    