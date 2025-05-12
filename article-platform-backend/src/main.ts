    // src/main.ts (Backend)
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
    import { ValidationPipe, Logger } from '@nestjs/common';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      const logger = app.get(Logger); // Get the app's logger instance

      app.setGlobalPrefix('api');

      const config = new DocumentBuilder()
        .setTitle('Article Platform API')
        .setDescription('API documentation for the Article Platform application.')
        .setVersion('1.0')
        .addTag('articles', 'Endpoints related to article management')
        .addTag('auth', 'Endpoints related to user authentication')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);

      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));

      app.enableCors({
        origin: process.env.FRONTEND_URL || '*', // Use env var for frontend URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });

      const port = process.env.PORT || 3000;
      await app.listen(port);
      logger.log(`Application is running on: ${await app.getUrl()}`, 'NestApplication');
      logger.log(`Swagger documentation is available at: ${await app.getUrl()}/api/docs`, 'NestApplication');

      // --- Seeder invocation has been removed from here ---
    }
    bootstrap();
    