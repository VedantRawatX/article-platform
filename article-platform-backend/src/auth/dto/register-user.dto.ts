    // src/auth/dto/register-user.dto.ts
    import { ApiProperty } from '@nestjs/swagger';
    import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'; // Added IsNotEmpty
    import { UserRole } from '../../users/entities/user.entity';

    export class RegisterUserDto {
      @ApiProperty({
        description: 'User email address (must be unique).',
        example: 'testuser@example.com',
        maxLength: 255,
      })
      @IsEmail({}, { message: 'Please provide a valid email address.' })
      @MaxLength(255)
      @IsNotEmpty({ message: 'Email cannot be empty.'})
      email: string;

      @ApiProperty({
        description: 'User password (at least 8 characters).',
        example: 'P@sswOrd123',
        minLength: 8,
        maxLength: 50,
      })
      @IsString()
      @MinLength(8, { message: 'Password must be at least 8 characters long.' })
      @MaxLength(50)
      @IsNotEmpty({ message: 'Password cannot be empty.'})
      password: string;

      @ApiProperty({
        description: "User's first name.",
        example: 'Test',
        maxLength: 100,
      })
      @IsString()
      @IsNotEmpty({ message: 'First name cannot be empty.' })
      @MaxLength(100)
      firstName: string; 

      @ApiProperty({
        description: "User's last name.",
        example: 'User',
        maxLength: 100,
      })
      @IsString()
      @IsNotEmpty({ message: 'Last name cannot be empty.' })
      @MaxLength(100)
      lastName: string; 

      @ApiProperty({
        description: 'Role of the user. Defaults to "user". Admins are typically created manually or via a separate process.',
        enum: UserRole,
        example: UserRole.USER,
        default: UserRole.USER,
        required: false,
      })
      @IsOptional()
      @IsEnum(UserRole)
      role?: UserRole = UserRole.USER;
    }