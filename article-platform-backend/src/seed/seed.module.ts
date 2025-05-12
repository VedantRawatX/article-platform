    // src/seed/seed.module.ts
    import { Module, Logger } from '@nestjs/common';
    import { ConfigModule } from '@nestjs/config';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { UsersModule } from '../users/users.module';
    import { ArticlesModule } from '../articles/articles.module';
    import { SeedService } from './seed.service';
    import { User } from '../users/entities/user.entity';
    import { Article } from '../articles/entities/article.entity';
    import { UserArticleLike } from '../articles/entities/user-article-like.entity'; // Ensure this is imported

    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        // Make User, Article, and UserArticleLike repositories available in this module's context
        TypeOrmModule.forFeature([User, Article, UserArticleLike]),
        UsersModule,    // Still needed as SeedService injects UsersService
        ArticlesModule, // Still needed as SeedService injects ArticlesService
      ],
      providers: [
        SeedService,
        Logger,
      ],
      exports: [SeedService],
    })
    export class SeedModule {}
    