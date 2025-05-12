import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique, JoinColumn, Column } from 'typeorm';
    import { User } from '../../users/entities/user.entity';
    import { Article } from './article.entity';
    import { ApiProperty } from '@nestjs/swagger';

    @Entity('user_saved_article')
    @Unique(['userId', 'articleId']) // A user can save an article only once
    export class UserSavedArticle {
      @ApiProperty({ description: 'Unique identifier for the saved article entry.' })
      @PrimaryGeneratedColumn('uuid')
      id: string;

      @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE', nullable: false })
      @JoinColumn({ name: 'userId' })
      user: User;

      @ApiProperty({ type: String, description: 'The ID of the user who saved the article.' })
      @Column()
      userId: string;

      @ManyToOne(() => Article, article => article.id, { onDelete: 'CASCADE', nullable: false })
      @JoinColumn({ name: 'articleId' })
      article: Article;

      @ApiProperty({ type: String, description: 'The ID of the article that was saved.' })
      @Column()
      articleId: string;

      @ApiProperty({ description: 'Timestamp when the article was saved.' })
      @CreateDateColumn({ type: 'timestamp with time zone' })
      savedAt: Date;
    }