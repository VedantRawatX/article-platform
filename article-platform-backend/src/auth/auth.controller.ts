// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request, // To access the request object, especially for request.user
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // For protecting routes with JWT
import { LocalAuthGuard } from './guards/local-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity'; // For typing response

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- USER REGISTRATION ---
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns an access token along with user details.',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered and logged in.',
    // Define a type for the response if you have one, e.g., AuthResponse
    // For now, let's assume it returns an object with accessToken and user
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          role: 'user',
          firstName: 'Test',
          lastName: 'User',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data (e.g., email format, password length).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during registration.',
  })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<AuthResponse> {
    return this.authService.register(registerUserDto);
  }

  // --- USER LOGIN ---
  // The LocalAuthGuard will trigger the LocalStrategy
  // If LocalStrategy.validate() is successful, request.user will be populated
  // Then, the login method in AuthService is called.
  @UseGuards(LocalAuthGuard) // Apply LocalAuthGuard here
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in an existing user',
    description:
      'Authenticates a user with email and password, and returns an access token along with user details.',
  })
  @ApiBody({ type: LoginUserDto }) // Document the expected request body
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'user@example.com', role: 'user' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error during login.',
  })
  async login(@Request() req: any): Promise<AuthResponse> {
    // req.user is populated by LocalAuthGuard/LocalStrategy upon successful validation
    // We then pass this user to the authService.login method, which expects a DTO.
    // However, our AuthService.login method is designed to re-validate and then sign.
    // A more direct approach after LocalAuthGuard is to directly use the user from req.user
    // to generate the token, as validation has already occurred.
    // Let's adjust AuthService.login or how we call it.
    // For now, we'll rely on the fact that LocalAuthGuard has validated the user
    // and authService.login will sign a token for req.user.
    // The `authService.login` method actually expects a LoginUserDto.
    // A cleaner way is to have LocalAuthGuard populate req.user, and then
    // a separate method in AuthService just signs the token for the user object.
    // Let's modify authService.login slightly or add a new method.
    // For simplicity for now, we'll call the existing login method,
    // which will re-validate, but it's a bit redundant after LocalAuthGuard.
    // A better pattern: LocalAuthGuard validates, then a handler calls jwtService.sign directly with req.user.

    // The `authService.login` method as currently written in Step 10 expects a LoginUserDto.
    // However, `req.user` (populated by `LocalAuthGuard`) is already the validated user object (Omit<User, 'password'>).
    // So, we should directly use `req.user` to generate the token.
    // Let's assume `authService.login` is adapted or we call a different method like `authService.generateJwt(req.user)`
    // For now, I will call a slightly modified login that can accept the user object.
    // Or, we can just pass the DTO again, and it will be re-validated by authService.login -> authService.validateUser
    // This is what the original NestJS auth example often does.
    return this.authService.login(req.body as LoginUserDto); // req.body contains the LoginUserDto
    // A more streamlined approach if LocalAuthGuard has already validated:
    // return this.authService.generateTokenForUser(req.user); // Assuming generateTokenForUser exists in AuthService
  }

  // --- GET USER PROFILE (Protected Route Example) ---
  @UseGuards(JwtAuthGuard) // Protect this route with JwtAuthGuard
  @Get('profile')
  @ApiBearerAuth() // Indicates in Swagger that this endpoint requires a Bearer token
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the profile of the currently authenticated user (requires JWT).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile data.',
    type: User, // Or a specific Profile DTO without password
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized. No or invalid token provided.',
  })
  async getProfile(@Request() req: any): Promise<Omit<User, 'password'>> {
    // req.user is populated by JwtStrategy.validate()
    // It already contains the user object (Omit<User, 'password'>)
    return req.user;
  }
}
