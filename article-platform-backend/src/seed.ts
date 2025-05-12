    // src/seed.ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module'; // Import your main AppModule
    import { SeedService } from './seed/seed.service';
    import { Logger } from '@nestjs/common';

    async function bootstrap() {
      // Create a standalone NestJS application context
      // This doesn't start a web server, just initializes the DI container and modules
      const appContext = await NestFactory.createApplicationContext(AppModule, {
        // You might want to disable logging for the entire app context creation
        // if it's too verbose, and rely on the SeedService's logger.
        // logger: false,
        // logger: ['error', 'warn'], // Or only log errors and warnings
      });

      const logger = appContext.get(Logger); // Get a logger instance
      const seedService = appContext.get(SeedService);

      logger.log('Seeder script started.', 'SeederScript');

      try {
        await seedService.runSeed();
        logger.log('Seeder script finished successfully.', 'SeederScript');
      } catch (error) {
        logger.error('Seeder script failed:', error.stack, 'SeederScript');
      } finally {
        // Close the application context to allow the script to exit gracefully
        await appContext.close();
        process.exit(0); // Ensure script exits
      }
    }

    bootstrap();
    