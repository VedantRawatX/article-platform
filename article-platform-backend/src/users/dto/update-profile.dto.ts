    // File: src/users/dto/update-profile.dto.ts
    import { ApiProperty } from '@nestjs/swagger';
    import { IsString, IsOptional, MaxLength, IsEmail } from 'class-validator';

    export class UpdateProfileDto {
      @ApiProperty({
        description: "User's first name.",
        example: 'John',
        maxLength: 100,
        required: false,
      })
      @IsOptional()
      @IsString()
      @MaxLength(100)
      firstName?: string;

      @ApiProperty({
        description: "User's last name.",
        example: 'Doe',
        maxLength: 100,
        required: false,
      })
      @IsOptional()
      @IsString()
      @MaxLength(100)
      lastName?: string;

      @ApiProperty({
        description: 'User email address (must be unique).',
        example: 'new.email@example.com',
        maxLength: 255,
        required: false,
      })
      @IsOptional()
      @IsEmail({}, { message: 'Please provide a valid email address.' })
      @MaxLength(255)
      email?: string;
      // Note: Changing email might require a re-verification process in a production app.
      // For simplicity, we'll allow direct update here.
    }
    