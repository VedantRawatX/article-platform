    // src/app.module.ts (Backend)
    import { Module, Logger } from '@nestjs/common';
    import { AppController } from './app.controller';
    import { AppService } from './app.service';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { ConfigModule, ConfigService } from '@nestjs/config';
    import { ArticlesModule } from './articles/articles.module';
    import { Article } from './articles/entities/article.entity';
    import { UserArticleLike } from './articles/entities/user-article-like.entity';
    import { UserSavedArticle } from './articles/entities/user-saved-article.entity';
    import { UsersModule } from './users/users.module';
    import { User } from './users/entities/user.entity';
    import { AuthModule } from './auth/auth.module';
    import { SeedModule } from './seed/seed.module';
    import { ChatModule } from './chat/chat.module'; // Import ChatModule

    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST', 'localhost'),
            port: configService.get<number>('DATABASE_PORT', 5432),
            username: configService.get<string>('DATABASE_USER', 'your_db_user'),
            password: configService.get<string>('DATABASE_PASSWORD', 'your_db_password'),
            database: configService.get<string>('DATABASE_NAME', 'article_platform_db'),
            entities: [Article, User, UserArticleLike, UserSavedArticle],
            synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
            logging: configService.get<boolean>('DATABASE_LOGGING', true),
          }),
          inject: [ConfigService],
        }),
        ArticlesModule,
        UsersModule,
        AuthModule,
        SeedModule,
        ChatModule, // Add ChatModule here
      ],
      controllers: [AppController],
      providers: [AppService, Logger],
    })
    export class AppModule {}
    