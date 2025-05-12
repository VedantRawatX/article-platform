    // File: src/users/dto/change-password.dto.ts
    import { ApiProperty } from '@nestjs/swagger';
    import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

    export class ChangePasswordDto {
      @ApiProperty({
        description: 'User\'s current password.',
        example: 'CurrentP@sswOrd123',
      })
      @IsString()
      @IsNotEmpty({ message: 'Current password cannot be empty.' })
      currentPassword: string;

      @ApiProperty({
        description: 'User\'s new password (at least 8 characters).',
        example: 'NewP@sswOrd123!',
        minLength: 8,
        maxLength: 50,
      })
      @IsString()
      @IsNotEmpty({ message: 'New password cannot be empty.' })
      @MinLength(8, { message: 'New password must be at least 8 characters long.' })
      @MaxLength(50)
      // Add regex for password complexity if desired, consistent with RegisterUserDto
      newPassword: string;
    }
    