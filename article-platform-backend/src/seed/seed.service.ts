    // src/seed/seed.service.ts
    import { Injectable, Logger } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository, Not } from 'typeorm';
    import { UsersService } from '../users/users.service';
    import { ArticlesService } from '../articles/articles.service';
    import { User, UserRole } from '../users/entities/user.entity';
    import { Article } from '../articles/entities/article.entity';
    import { UserArticleLike } from '../articles/entities/user-article-like.entity';
    import { ArticleCategory } from '../articles/entities/article-category.enum';
    import { CreateArticleDto } from '../articles/dto/create-article.dto';
    import { RegisterUserDto } from '../auth/dto/register-user.dto';

    @Injectable()
    export class SeedService {
      private readonly logger: Logger = new Logger(SeedService.name);

      constructor(
        private readonly usersService: UsersService,
        private readonly articlesService: ArticlesService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(UserArticleLike)
        private readonly userArticleLikeRepository: Repository<UserArticleLike>,
      ) {}

      private logSection(title: string) {
        this.logger.log('============================================================');
        this.logger.log(`🌱 SEEDING: ${title}`);
        this.logger.log('============================================================');
      }

      private logInfo(message: string) {
        this.logger.log(`[INFO] ${message}`, SeedService.name);
      }

      private logSuccess(message: string) {
        this.logger.log(`✅ [SUCCESS] ${message}`, SeedService.name);
      }

      private logWarning(message: string) {
        this.logger.warn(`⚠️ [WARN] ${message}`, SeedService.name);
      }

      private logError(message: string, trace?: string) {
        this.logger.error(`❌ [ERROR] ${message}`, trace, SeedService.name);
      }


      async runSeed() {
        this.logSection('STARTING DATABASE SEEDING PROCESS (CLI)');
        await this.clearData();
        await this.seedUsers();
        await this.seedArticles();
        this.logSection('DATABASE SEEDING COMPLETED (CLI)');
      }

      private async clearData() {
        this.logSection('CLEARING EXISTING DATA');
        try {
          const deleteLikesResult = await this.userArticleLikeRepository.createQueryBuilder().delete().from(UserArticleLike).execute();
          this.logInfo(`Cleared ${deleteLikesResult.affected || 0} user_article_likes.`);
        } catch (error) { this.logError('Failed to clear user_article_likes.', error.stack); }
        try {
          const deleteArticlesResult = await this.articleRepository.createQueryBuilder().delete().from(Article).execute();
          this.logInfo(`Cleared ${deleteArticlesResult.affected || 0} articles.`);
        } catch (error) { this.logError('Failed to clear articles.', error.stack); }
        try {
          const deleteUsersResult = await this.userRepository.delete({ role: Not(UserRole.ADMIN) });
          this.logInfo(`Cleared ${deleteUsersResult.affected || 0} non-admin users.`);
          const adminCount = await this.userRepository.count({ where: { role: UserRole.ADMIN }});
          this.logInfo(`${adminCount} admin user(s) preserved.`);
        } catch (error) { this.logError('Failed to clear non-admin users.', error.stack); }
      }

      private async seedUsers() {
        this.logSection('SEEDING USERS');
        const usersToSeed: RegisterUserDto[] = [
          { email: 'admin@example.com', password: 'Password123!', firstName: 'Admin', lastName: 'Root', role: UserRole.ADMIN },
          { email: 'user1@example.com', password: 'Password123!', firstName: 'Alice', lastName: 'Smith', role: UserRole.USER },
          { email: 'user2@example.com', password: 'Password123!', firstName: 'Bob', lastName: 'Johnson', role: UserRole.USER },
        ];
        // All seeded users already have firstName and lastName.

        for (const userData of usersToSeed) {
          try {
            const existingUser = await this.usersService.findByEmail(userData.email);
            if (!existingUser) {
              await this.usersService.create(userData);
              this.logSuccess(`User ${userData.email} created.`);
            } else {
              // If user exists, ensure their firstName and lastName are updated if they were missing
              if (existingUser && (!existingUser.firstName || !existingUser.lastName)) {
                await this.userRepository.update(existingUser.id, {
                  firstName: userData.firstName,
                  lastName: userData.lastName
                });
                this.logInfo(`Updated missing names for existing user ${userData.email}.`);
              } else {
                this.logWarning(`User ${userData.email} already exists with names. Skipping.`);
              }
            }
          } catch (error) {
            this.logError(`Failed to seed user ${userData.email}: ${error.message}`, error.stack);
          }
        }
      }

      private async seedArticles() {
        this.logSection('SEEDING ARTICLES (15 Detailed Articles with Enum Categories)');
        const articlesToSeed: CreateArticleDto[] = [
          // ... (15 detailed articles from the previous version should be here) ...
          // Ensure the full article definitions are present here.
          {
            title: 'Getting Started with NestJS: A Comprehensive Guide',
            body: `NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses modern JavaScript, is built with TypeScript (which helps in maintaining a robust codebase), and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).\n\nThis guide will walk you through the initial setup, core concepts like modules, controllers, and services, and how to build your first NestJS application. We'll cover topics such as routing, middleware, and basic data persistence. By the end, you'll have a solid understanding of why NestJS is a popular choice for backend development. We will also touch upon dependency injection, a key feature of NestJS that promotes modularity and testability.`,
            imageUrl: 'https://placehold.co/600x400/7B3FE4/FFFFFF?text=NestJS+Guide',
            category: ArticleCategory.TECH,
            tags: ['nestjs', 'typescript', 'backend', 'node', 'guide'],
            isPublished: true,
          },
          {
            title: 'Mastering React Hooks: useState, useEffect, and useContext Explained',
            body: `React Hooks, introduced in React 16.8, revolutionized how developers write React components. They allow you to use state and other React features without writing a class. This article provides an in-depth look at the most commonly used hooks: useState for managing local component state, useEffect for handling side effects (like data fetching or subscriptions), and useContext for accessing context API values without prop drilling.\n\nWe'll explore practical examples, common pitfalls, and best practices for using these hooks effectively to build cleaner, more maintainable, and more powerful functional components. Understanding the rules of hooks and how the dependency array in useEffect works is crucial for avoiding bugs and optimizing performance.`,
            imageUrl: 'https://placehold.co/600x400/3FE4A4/FFFFFF?text=React+Hooks+Deep+Dive',
            category: ArticleCategory.TECH, // Use enum
            tags: ['react', 'javascript', 'hooks', 'frontend', 'tutorial'],
            isPublished: true,
          },
          {
            title: 'The Crucial Role of Database Seeding in Modern Development Workflows',
            body: `Database seeding is the process of populating a database with an initial set of data. While it might seem like an extra step, it's an indispensable part of modern software development and testing workflows. Seed data provides a consistent starting point for development, allows for effective automated testing, and can be used for creating realistic demo environments.\n\nThis article discusses the benefits of database seeding, different strategies for implementing it (e.g., using ORM features, custom scripts), and best practices to ensure your seed data is useful, maintainable, and doesn't interfere with production environments. We'll also look at tools and libraries that can simplify the seeding process in various backend frameworks.`,
            imageUrl: 'https://placehold.co/600x400/E4A23F/FFFFFF?text=DB+Seeding+Strategies',
            category: ArticleCategory.GENERAL, // Use enum
            tags: ['database', 'seeding', 'testing', 'devops', 'workflow'],
            isPublished: true,
          },
          {
            title: 'Exploring the Expanding Universe of Artificial Intelligence (Draft)',
            body: `Artificial Intelligence (AI) is no longer a concept confined to science fiction; it's rapidly transforming our world across various industries, from healthcare and finance to entertainment and transportation. This article embarks on an exploration of its diverse facets, including machine learning, deep learning, natural language processing (NLP), and computer vision.\n\nWe will delve into the potential future implications of AI, discussing both its immense benefits and the ethical challenges it presents. The development of AGI (Artificial General Intelligence) remains a distant but fascinating goal, while current AI applications are already making significant impacts. This piece is currently a draft and will be updated with more case studies and expert opinions.`,
            imageUrl: 'https://placehold.co/600x400/C7C7C7/FFFFFF?text=AI+Exploration+Draft',
            category: ArticleCategory.TECH, // Use enum
            tags: ['ai', 'machine learning', 'future', 'ethics', 'draft'],
            isPublished: false,
          },
           {
            title: 'Advanced CSS Techniques for Stunning User Interfaces',
            body: `Modern CSS has evolved far beyond simple styling. With powerful features like CSS Grid, Flexbox, custom properties (CSS variables), and advanced selectors, developers can create incredibly complex and responsive user interfaces with more semantic and maintainable code. This article dives deep into these techniques.\n\nWe'll explore practical examples of how to leverage Grid for two-dimensional layouts, Flexbox for one-dimensional alignment and distribution, and custom properties for creating dynamic and themeable designs. We will also cover topics like CSS animations, transitions, and pseudo-elements to add that extra layer of polish to your web applications.`,
            imageUrl: 'https://placehold.co/600x400/F43F5E/FFFFFF?text=Advanced+CSS+UI',
            category: ArticleCategory.TECH, // Use enum
            tags: ['css', 'frontend', 'design', 'flexbox', 'grid', 'animation'],
            isPublished: true,
          },
          {
            title: 'The Rise of Serverless Architecture: Benefits and Challenges',
            body: `Serverless architecture, often associated with Function-as-a-Service (FaaS), allows developers to build and run applications without managing servers. Cloud providers dynamically allocate resources, and you only pay for what you use. This model offers significant benefits in terms of scalability, cost-efficiency, and reduced operational overhead.\n\nHowever, serverless also comes with its own set of challenges, including potential vendor lock-in, cold starts, and difficulties with local testing and debugging. This article explores the pros and cons of serverless, common use cases (like APIs, data processing, and IoT backends), and key considerations when deciding if it's the right fit for your project.`,
            imageUrl: 'https://placehold.co/600x400/6366F1/FFFFFF?text=Serverless+Deep+Dive',
            category: ArticleCategory.TECH, // Use enum
            tags: ['serverless', 'faas', 'aws lambda', 'cloud', 'architecture'],
            isPublished: true,
          },
          {
            title: 'GraphQL vs. REST: Choosing the Right API Design Paradigm',
            body: `When building APIs, developers often face the choice between REST (Representational State Transfer) and GraphQL. REST has been the de facto standard for years, known for its simplicity and use of HTTP methods. GraphQL, on the other hand, offers a more flexible query language, allowing clients to request exactly the data they need and nothing more.\n\nThis article compares GraphQL and REST across various aspects, including data fetching efficiency, caching, error handling, schema and type systems, and developer experience. We'll discuss scenarios where one might be preferred over the other and how they can even coexist in a microservices architecture.`,
            imageUrl: 'https://placehold.co/600x400/EC4899/FFFFFF?text=GraphQL+vs+REST',
            category: ArticleCategory.TECH, // Use enum
            tags: ['graphql', 'rest', 'api', 'backend', 'architecture'],
            isPublished: true,
          },
          {
            title: 'Effective State Management in Large-Scale React Applications',
            body: `As React applications grow in complexity, managing state effectively becomes a critical challenge. While React's built-in useState and useContext hooks are suitable for many cases, larger applications often benefit from more robust state management libraries like Redux, Zustand, or Recoil.\n\nThis article explores different state management patterns and libraries in the React ecosystem. We'll discuss their core concepts, trade-offs, and best practices for choosing and implementing a solution that scales well, improves developer productivity, and ensures predictable state updates. We'll also touch upon immutability and devtools for easier debugging.`,
            imageUrl: 'https://placehold.co/600x400/10B981/FFFFFF?text=React+State+Management',
            category: ArticleCategory.TECH, // Use enum
            tags: ['react', 'state management', 'redux', 'zustand', 'frontend'],
            isPublished: true,
          },
          {
            title: 'Introduction to Docker and Containerization for Developers',
            body: `Docker has revolutionized how applications are built, shipped, and run by leveraging containerization technology. Containers package an application and its dependencies into a standardized unit, ensuring consistency across different environments from development to production.\n\nThis introductory guide explains the core concepts of Docker, including images, containers, Dockerfiles, and Docker Compose. We'll walk through practical examples of how to containerize a simple web application, manage container lifecycles, and understand the benefits Docker brings to the development workflow, such as improved portability, scalability, and isolation.`,
            imageUrl: 'https://placehold.co/600x400/0EA5E9/FFFFFF?text=Docker+Intro',
            category: ArticleCategory.GENERAL, // Use enum
            tags: ['docker', 'containerization', 'devops', 'deployment'],
            isPublished: true,
          },
          {
            title: 'Cybersecurity Fundamentals for Web Developers (Draft)',
            body: `In an increasingly connected world, cybersecurity is paramount. Web developers play a crucial role in building secure applications. This article covers fundamental cybersecurity concepts that every web developer should be aware of, including common vulnerabilities like XSS (Cross-Site Scripting), SQL Injection, CSRF (Cross-Site Request Forgery), and insecure authentication/authorization mechanisms.\n\nWe'll discuss defensive coding practices, the importance of input validation, output encoding, using HTTPS, secure password storage, and implementing proper security headers. This is a draft and will be expanded with more specific code examples and mitigation techniques for various attack vectors.`,
            imageUrl: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Web+Security+Basics',
            category: ArticleCategory.TECH, // Use enum
            tags: ['cybersecurity', 'web development', 'owasp', 'security', 'draft'],
            isPublished: false,
          },
          {
            title: 'The Future of Web Development: Trends to Watch in 2025 and Beyond',
            body: `The web development landscape is constantly evolving. Staying updated with the latest trends is crucial for developers and businesses alike. This article explores key trends shaping the future of web development, including the rise of AI-powered development tools, the increasing adoption of WebAssembly, advancements in Jamstack architecture, the growing importance of edge computing, and the continued focus on web performance and accessibility.\n\nWe'll also discuss the evolving role of JavaScript frameworks, the potential of no-code/low-code platforms, and the implications of emerging technologies like Web3 and the metaverse on web experiences.`,
            imageUrl: 'https://placehold.co/600x400/D97706/FFFFFF?text=Web+Dev+Trends+2025',
            category: ArticleCategory.NEWS, // Use enum
            tags: ['web development', 'future tech', 'trends', 'ai', 'webassembly'],
            isPublished: true,
          },
          {
            title: 'A Practical Guide to Test-Driven Development (TDD)',
            body: `Test-Driven Development (TDD) is a software development practice where developers write tests before writing the actual code. This "red-green-refactor" cycle helps ensure code quality, reduces bugs, and leads to more modular and maintainable designs.\n\nThis guide provides a practical introduction to TDD, explaining its core principles and benefits. We'll walk through an example of applying TDD to a simple feature, covering unit tests, mocking dependencies, and how TDD can improve the overall development process and developer confidence.`,
            imageUrl: 'https://placehold.co/600x400/EF4444/FFFFFF?text=TDD+Guide',
            category: ArticleCategory.GENERAL, // Use enum
            tags: ['tdd', 'testing', 'agile', 'software development', 'best practices'],
            isPublished: true,
          },
          {
            title: 'Understanding Microservices: An Architectural Overview',
            body: `Microservices architecture is an approach to developing a single application as a suite of small, independently deployable services. Each service runs in its own process and communicates with others, typically using lightweight mechanisms like HTTP APIs. This architectural style offers benefits such as improved scalability, fault isolation, and technology diversity.\n\nThis overview covers the core concepts of microservices, contrasts them with monolithic architectures, and discusses common patterns and challenges in designing, deploying, and managing microservices-based systems, including service discovery, inter-service communication, and data consistency.`,
            imageUrl: 'https://placehold.co/600x400/14B8A6/FFFFFF?text=Microservices+Overview',
            category: ArticleCategory.TECH, // Use enum
            tags: ['microservices', 'architecture', 'distributed systems', 'backend'],
            isPublished: true,
          },
          {
            title: 'Optimizing Web Performance: Core Web Vitals and Beyond',
            body: `Web performance is critical for user experience, engagement, and SEO. Google's Core Web Vitals (Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift) have become key metrics for measuring user experience. This article delves into strategies for optimizing these vitals and other performance aspects.\n\nWe'll cover techniques like image optimization, code splitting, lazy loading, minimizing render-blocking resources, browser caching, and leveraging CDNs. Understanding how to analyze performance using tools like Lighthouse and WebPageTest is also crucial for identifying and addressing bottlenecks.`,
            imageUrl: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Web+Performance+Optimization',
            category: ArticleCategory.TECH, // Use enum
            tags: ['web performance', 'core web vitals', 'seo', 'optimization', 'frontend'],
            isPublished: true,
          },
          {
            title: 'Building Accessible Web Applications: A Developer\'s Checklist (Draft)',
            body: `Web accessibility (a11y) ensures that people with disabilities can perceive, understand, navigate, and interact with the web. Building accessible applications is not just a legal requirement in many places but also a moral imperative and good business practice. This checklist aims to guide developers in creating more inclusive web experiences.\n\nTopics will include semantic HTML, ARIA attributes, keyboard navigation, focus management, color contrast, accessible forms, and testing with assistive technologies. This is a draft and will be expanded with more detailed examples and resources.`,
            imageUrl: 'https://placehold.co/600x400/4F46E5/FFFFFF?text=Web+Accessibility+A11Y',
            category: ArticleCategory.GENERAL, // Use enum
            tags: ['a11y', 'accessibility', 'web standards', 'inclusive design', 'draft'],
            isPublished: false,
          }
        ];
        // Ensure the full body content from the previous version is included for all 15 articles.

        let createdCount = 0;
        for (const articleData of articlesToSeed) {
          try {
            const paginatedResponse = await this.articlesService.findAll(1, 1000);
            const articleExists = paginatedResponse.data.some(a => a.title === articleData.title);

            if (!articleExists) {
              await this.articlesService.create(articleData);
              this.logSuccess(`Article "${articleData.title}" created with category: ${articleData.category}.`);
              createdCount++;
            } else {
              this.logWarning(`Article "${articleData.title}" already exists. Skipping.`);
            }
          } catch (error) {
            this.logError(`Failed to seed article "${articleData.title}": ${error.message}`, error.stack);
          }
        }
        this.logInfo(`Finished seeding articles. ${createdCount} new articles added.`);
      }
    }
    