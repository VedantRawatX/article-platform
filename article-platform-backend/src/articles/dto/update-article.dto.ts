// src/articles/dto/update-article.dto.ts
import { PartialType } from '@nestjs/swagger'; // Or from '@nestjs/mapped-types'
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
