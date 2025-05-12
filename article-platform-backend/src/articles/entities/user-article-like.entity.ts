    // src/articles/entities/user-article-like.entity.ts
    import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, JoinColumn, Column } from 'typeorm';
    import { User } from '../../users/entities/user.entity';
    import { Article } from './article.entity';
    import { ApiProperty } from '@nestjs/swagger';

    @Entity('user_article_likes')
    @Unique(['userId', 'articleId']) // Ensures a user can only like an article once, using the direct column names
    export class UserArticleLike {
      @ApiProperty({ description: 'Unique identifier for the like entry.' })
      @PrimaryGeneratedColumn('uuid')
      id: string;

      // Relation to User
      @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE', nullable: false }) // user is a required relation
      @JoinColumn({ name: 'userId' }) // This defines the FK column in the DB as 'userId'
      user: User;

      // Foreign key column for User. This property holds the ID value.
      @ApiProperty({ type: String, description: 'The ID of the user who liked the article.' })
      @Column() // Explicitly mark as a column
      userId: string;

      // Relation to Article
      @ManyToOne(() => Article, article => article.id, { onDelete: 'CASCADE', nullable: false }) // article is a required relation
      @JoinColumn({ name: 'articleId' }) // This defines the FK column in the DB as 'articleId'
      article: Article;

      // Foreign key column for Article. This property holds the ID value.
      @ApiProperty({ type: String, description: 'The ID of the article that was liked.' })
      @Column() // Explicitly mark as a column
      articleId: string;

      @ApiProperty({ description: 'Timestamp when the like was created.' })
      @CreateDateColumn({ type: 'timestamp with time zone' })
      createdAt: Date;
    }
    