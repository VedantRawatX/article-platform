    // src/auth/auth.controller.ts
    import {
      Controller,
      Post,
      Body,
      HttpCode,
      HttpStatus,
      UseGuards,
      Get,
      Request,
      Patch, // Import Patch
    } from '@nestjs/common';
    import { AuthService, AuthResponse } from './auth.service';
    import { UsersService } from '../users/users.service'; // Import UsersService
    import { RegisterUserDto } from './dto/register-user.dto';
    import { LoginUserDto } from './dto/login-user.dto';
    import { UpdateProfileDto } from '../users/dto/update-profile.dto'; // Import DTO
    import { ChangePasswordDto } from '../users/dto/change-password.dto'; // Import DTO
    import { LocalAuthGuard } from './guards/local-auth.guard';
    import { JwtAuthGuard } from './guards/jwt-auth.guard';
    import {
      ApiTags,
      ApiOperation,
      ApiResponse,
      ApiBody,
      ApiBearerAuth,
    } from '@nestjs/swagger';
    import { User } from '../users/entities/user.entity';

    @ApiTags('auth & profile') // Updated tag to include profile
    @Controller('auth') // Base path remains /auth for login/register
    export class AuthController {
      constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService, // Inject UsersService
        ) {}

      @Post('register')
      @HttpCode(HttpStatus.CREATED)
      @ApiOperation({ summary: 'Register a new user' })
      @ApiBody({ type: RegisterUserDto })
      @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered and logged in.', schema: { example: { accessToken: 'jwt.token', user: { id: 'uuid', email: 'user@example.com', role: 'user' }}}})
      async register(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponse> {
        return this.authService.register(registerUserDto);
      }

      @UseGuards(LocalAuthGuard)
      @Post('login')
      @HttpCode(HttpStatus.OK)
      @ApiOperation({ summary: 'Log in an existing user' })
      @ApiBody({ type: LoginUserDto })
      @ApiResponse({ status: HttpStatus.OK, description: 'User logged in.', schema: { example: { accessToken: 'jwt.token', user: { id: 'uuid', email: 'user@example.com', role: 'user' }}}})
      @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
      async login(@Request() req: any): Promise<AuthResponse> {
        // req.user is populated by LocalAuthGuard
        // authService.login now directly uses this user to sign the token
        return this.authService.login(req.user); // Pass the validated user from LocalStrategy
      }

      // --- USER PROFILE MANAGEMENT ---
      // The /auth/profile endpoint already exists for GET, let's keep it for consistency
      // Or you could move these to a /users/me or /profile controller

      @UseGuards(JwtAuthGuard)
      @Get('profile')
      @ApiBearerAuth()
      @ApiOperation({ summary: 'Get current user profile' })
      @ApiResponse({ status: HttpStatus.OK, description: 'Current user profile data.', type: User }) // Consider a UserResponseDto without password
      @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
      async getProfile(@Request() req: any): Promise<Omit<User, 'password'>> {
        // req.user is populated by JwtStrategy.validate() with Omit<User, 'password'>
        return req.user;
      }

      @UseGuards(JwtAuthGuard)
      @Patch('profile') // Using PATCH for partial updates to profile
      @ApiBearerAuth()
      @ApiOperation({ summary: 'Update current user profile' })
      @ApiBody({ type: UpdateProfileDto })
      @ApiResponse({ status: HttpStatus.OK, description: 'Profile updated successfully.', type: User }) // Consider UserResponseDto
      @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
      @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
      @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already in use.' })
      async updateProfile(
        @Request() req: any,
        @Body() updateProfileDto: UpdateProfileDto,
      ): Promise<Omit<User, 'password'>> {
        const userId = req.user.id;
        return this.usersService.updateProfile(userId, updateProfileDto);
      }

      @UseGuards(JwtAuthGuard)
      @Post('profile/change-password') // Specific route for changing password
      @HttpCode(HttpStatus.OK) // Or 204 No Content if not returning anything
      @ApiBearerAuth()
      @ApiOperation({ summary: 'Change current user password' })
      @ApiBody({ type: ChangePasswordDto })
      @ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully.' })
      @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized or incorrect current password.' })
      @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data (e.g., new password too short).' })
      async changePassword(
        @Request() req: any,
        @Body() changePasswordDto: ChangePasswordDto,
      ): Promise<{ message: string }> { // Return a simple success message
        const userId = req.user.id;
        await this.usersService.changePassword(userId, changePasswordDto);
        return { message: 'Password changed successfully.' };
      }
    }
    