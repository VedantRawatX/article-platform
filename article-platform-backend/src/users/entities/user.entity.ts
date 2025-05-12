    // src/users/entities/user.entity.ts
    import { ApiProperty } from '@nestjs/swagger';
    import { Exclude } from 'class-transformer';
    import {
      PrimaryGeneratedColumn,
      Column,
      CreateDateColumn,
      UpdateDateColumn,
      Entity,
      Index,
      Unique,
    } from 'typeorm';

    export enum UserRole {
      ADMIN = 'admin',
      USER = 'user',
    }

    @Entity('users')
    @Unique(['email'])
    export class User {
      @ApiProperty({
        description: 'The unique identifier of the user.',
        example: 'b1g7f3hsd0000m801z1y2z3x4',
        readOnly: true,
      })
      @PrimaryGeneratedColumn('uuid')
      id: string;

      @ApiProperty({
        description: 'The email address of the user (used for login).',
        example: 'user@example.com',
        maxLength: 255,
      })
      @Index()
      @Column({ type: 'varchar', length: 255 })
      email: string;

      @Exclude()
      @Column({ type: 'varchar', length: 255 })
      password: string;

      @ApiProperty({
        description: 'The role of the user.',
        enum: UserRole,
        example: UserRole.USER,
        default: UserRole.USER,
      })
      @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
      })
      role: UserRole;

      @ApiProperty({
        description: "The user's first name.",
        example: 'John',
        maxLength: 100,
      })
      @Column({ type: 'varchar', length: 100, nullable: false }) // Changed nullable to false
      firstName: string; // No longer optional

      @ApiProperty({
        description: "The user's last name.",
        example: 'Doe',
        maxLength: 100,
      })
      @Column({ type: 'varchar', length: 100, nullable: false }) // Changed nullable to false
      lastName: string; // No longer optional

      @ApiProperty({
        description: 'The date and time when the user account was created.',
        readOnly: true,
      })
      @CreateDateColumn({ type: 'timestamp with time zone' })
      createdAt: Date;

      @ApiProperty({
        description: 'The date and time when the user account was last updated.',
        readOnly: true,
      })
      @UpdateDateColumn({ type: 'timestamp with time zone' })
      updatedAt: Date;
    }
    