// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
// import { UsersController } from './users.controller'; // We might add this later

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register the User entity
  ],
  // controllers: [UsersController], // Controller can be added if direct user management endpoints are needed
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule], // Export UsersService for AuthModule and TypeOrmModule for the entity
})
export class UsersModule {}
