# Article Platform

The Article Platform is a full-stack application featuring a NestJS backend and a React frontend. It allows admins to manage articles (CRUD operations) and users to view articles, like them, and save them for later reading.

## Table of Contents

1.  [Core Features](#core-features)
2.  [Technical Stack](#technical-stack)
3.  [Prerequisites](#prerequisites)
4.  [Project Structure](#project-structure)
5.  [Backend Setup (NestJS)](#backend-setup-nestjs)
    * [Cloning the Repository](#cloning-the-repository)
    * [Installation](#installation)
    * [Environment Configuration (.env)](#environment-configuration-env)
    * [Database Setup](#database-setup)
    * [Running the Database Seeder](#running-the-database-seeder)
    * [Running the Backend Server](#running-the-backend-server)
6.  [Frontend Setup (React)](#frontend-setup-react)
    * [Installation](#installation-1)
    * [Environment Configuration (.env)](#environment-configuration-env-1)
    * [Running the Frontend Server](#running-the-frontend-server)
7.  [Available Scripts](#available-scripts)
    * [Backend](#backend)
    * [Frontend](#frontend)
8.  [API Documentation](#api-documentation)

## Core Features

* **User Authentication:** Login system differentiating Admin and User roles using JWT.
* **Article Management (Admin):** CRUD operations for articles (title, body, image, category, tags).
* **Article Display (User):**
    * Public landing page with limited articles.
    * Responsive card-based UI for browsing articles.
    * Pagination, search, filter (category, tags), and sort functionalities.
    * Individual article view.
    * Like/Unlike articles.
    * Save/Unsave articles with a dedicated sidebar for saved articles.
* **API Management:** Backend endpoints documented with Swagger/OpenAPI.

## Technical Stack

**Backend:**
* Framework: NestJS 11
* Language: TypeScript
* Database: PostgreSQL
* ORM: TypeORM
* Authentication: JWT (Passport.js)
* Validation: class-validator, class-transformer
* API Documentation: Swagger (@nestjs/swagger)

**Frontend:**
* Framework: React 19
* Bundler: Vite
* Language: TypeScript
* UI Library: React Bootstrap
* Routing: React Router DOM v6
* State Management: React Context API (for Auth and Toasts)
* API Calls: Fetch API

## Prerequisites

* Node.js (v18.x or later recommended)
* npm (v9.x or later) or yarn (v1.22.x or later)
* PostgreSQL server installed and running.
* Git (for cloning the repository)

## Project Structure

It's assumed you have two main directories, one for the backend and one for the frontend, typically in the same parent folder:

article-platform/├── article-platform-backend/   # NestJS backend└── article-platform-frontend/  # React frontend
## Backend Setup (NestJS)

Follow these steps to set up and run the backend server.

### Cloning the Repository

(If you haven't already, clone the repository that contains the `article-platform-backend` directory.)
```bash
git clone <your-repository-url>
cd <your-repository-url>/article-platform-backend
InstallationNavigate to the backend project directory and install dependencies:cd article-platform-backend
npm install
# or
# yarn install
Install ts-node and tsconfig-paths globally or as dev dependencies if not already present (for the seeder script):npm install --save-dev ts-node tsconfig-paths
# or
# yarn add --dev ts-node tsconfig-paths
Environment Configuration (.env)Create a .env file in the root of the article-platform-backend directory. Copy the contents of .env.example (if provided) or use the template below and fill in your details:# Backend .env configuration
# File: article-platform-backend/.env

# Application Port
PORT=3000

# PostgreSQL Connection Details
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_db_username # Replace with your PostgreSQL username
DATABASE_PASSWORD=your_db_password # Replace with your PostgreSQL password
DATABASE_NAME=article_platform_db # Replace with your PostgreSQL database name

# TypeORM Settings
DATABASE_SYNCHRONIZE=true # Set to true for development (auto-creates schema). Set to false in production and use migrations.
DATABASE_LOGGING=true # Set to true to see SQL queries in console during development.

# JWT Settings
JWT_SECRET=YOUR_VERY_STRONG_AND_UNIQUE_SECRET_KEY_HERE # Replace with a strong random string
JWT_EXPIRES_IN=1h # Example: 1 hour. Use '7d' for 7 days, etc.

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:5173 # Adjust if your frontend runs on a different port

# Seeder Control (No longer used for automatic seeding on startup)
# RUN_SEEDER=false
Important:Replace placeholder values (like your_db_username, your_db_password, YOUR_VERY_STRONG_AND_UNIQUE_SECRET_KEY_HERE) with your actual credentials and secrets.Ensure the DATABASE_USER has privileges to create databases if DATABASE_NAME doesn't exist and DATABASE_SYNCHRONIZE=true. Otherwise, create the database manually.Database SetupEnsure your PostgreSQL server is running and accessible with the credentials provided in the .env file. If DATABASE_SYNCHRONIZE=true, NestJS/TypeORM will attempt to create the database schema (tables) when the application starts or when the seeder runs for the first time.Running the Database SeederThe seeder script populates the database with initial data (admin user, sample users, and articles). It will clear existing articles and non-admin users before seeding.To run the seeder:npm run seed
# or
# yarn seed
Make sure the backend server is stopped before running the seeder if it involves schema changes or you want to avoid potential conflicts.Running the Backend ServerTo start the backend development server:npm run start:dev
# or
# yarn start:dev
The server will typically run on http://localhost:3000 (or the PORT specified in your .env).Frontend Setup (React)Follow these steps to set up and run the React frontend.InstallationNavigate to the frontend project directory and install dependencies:cd ../article-platform-frontend # Assuming you are in the backend directory
# or cd path/to/article-platform-frontend
npm install
# or
# yarn install
Install uuid and its types if not already present (for the Toast context):npm install uuid
npm install --save-dev @types/uuid
# or
# yarn add uuid
# yarn add --dev @types/uuid
Environment Configuration (.env)Create a .env file in the root of the article-platform-frontend directory. Add the following, adjusting the URL if your backend runs on a different port:# Frontend .env configuration
# File: article-platform-frontend/.env

VITE_API_BASE_URL=http://localhost:3000/api
Note: Vite requires environment variables to be prefixed with VITE_ to be exposed to the frontend code.Running the Frontend ServerTo start the frontend development server:npm run dev
# or
# yarn dev
The frontend will typically run on http://localhost:5173 (Vite's default) or another port if specified. Open this URL in your browser.Available ScriptsBackend (article-platform-backend/package.json)npm run start:dev: Starts the backend server in development mode with auto-reload.npm run build: Compiles the TypeScript code to JavaScript.npm run start:prod: Starts the backend server from the compiled build (for production).npm run seed: Runs the database seeder script.npm run lint: Lints the codebase.npm run test: Runs unit tests.Frontend (article-platform-frontend/package.json)npm run dev: Starts the frontend development server (Vite).npm run build: Builds the frontend application for production.npm run preview: Serves the production build locally for preview.npm run lint: Lints the codebase.API DocumentationOnce the backend server is running, Swagger API documentation is available at:`