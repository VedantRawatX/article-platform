    // src/articles/dto/create-article.dto.ts
    import { ApiProperty } from '@nestjs/swagger';
    import {
      IsString,
      IsNotEmpty,
      MaxLength,
      IsOptional,
      IsUrl,
      IsArray,
      ArrayNotEmpty,
      IsBoolean,
      IsEnum, // Import IsEnum
    } from 'class-validator';
    import { ArticleCategory } from '../entities/article-category.enum'; // Import the enum

    export class CreateArticleDto {
      @ApiProperty({
        description: 'The title of the article.',
        example: 'My First NestJS Article',
        maxLength: 255,
      })
      @IsString()
      @IsNotEmpty()
      @MaxLength(255)
      title: string;

      @ApiProperty({
        description: 'The main content/body of the article.',
        example: 'This article explains how to create DTOs in NestJS...',
      })
      @IsString()
      @IsNotEmpty()
      body: string;

      @ApiProperty({
        description: 'URL of the cover image for the article.',
        example: 'https://example.com/images/my-article-cover.jpg',
        required: false,
      })
      @IsOptional()
      @IsUrl({}, { message: 'Image URL must be a valid URL.' })
      @MaxLength(512)
      imageUrl?: string;

      @ApiProperty({
        description: 'The category of the article.',
        enum: ArticleCategory,
        example: ArticleCategory.TECH,
      })
      @IsEnum(ArticleCategory, { message: 'Invalid category selected.' })
      @IsNotEmpty()
      category: ArticleCategory;

      @ApiProperty({
        description: 'Tags associated with the article.',
        example: ['nestjs', 'dto', 'validation'],
        type: [String],
      })
      @IsArray()
      @ArrayNotEmpty()
      @IsString({ each: true })
      tags: string[];

      @ApiProperty({
        description: 'Indicates if the article should be published immediately.',
        example: true,
        default: true,
        required: false,
      })
      @IsOptional()
      @IsBoolean()
      isPublished?: boolean = true;
    }
    