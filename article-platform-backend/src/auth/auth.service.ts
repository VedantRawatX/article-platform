// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../users/entities/user.entity'; // For type hints

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>; // User details without password
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user based on email and password.
   * Used by the LocalStrategy.
   * @param email - User's email.
   * @param pass - User's plain text password.
   * @returns The user object (without password) if validation is successful, otherwise null.
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result; // Return user object without the password
    }
    return null; // User not found or password doesn't match
  }

  /**
   * Handles user login.
   * If credentials are valid, generates and returns a JWT.
   * @param loginUserDto - Contains email and password for login.
   * @returns An object containing the access token and user details.
   * @throws UnauthorizedException if login fails.
   */
  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const validatedUser = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!validatedUser) {
      throw new UnauthorizedException(
        'Invalid credentials. Please check your email and password.',
      );
    }

    const payload = {
      username: validatedUser.email, // Standard JWT claim for username
      sub: validatedUser.id, // Standard JWT claim for subject (user ID)
      role: validatedUser.role, // Custom claim for user role
    };

    try {
      const accessToken = this.jwtService.sign(payload);
      return {
        accessToken: accessToken,
        user: validatedUser, // validatedUser is already Omit<User, 'password'>
      };
    } catch (error) {
      console.error('Error signing JWT:', error);
      throw new InternalServerErrorException(
        'Login failed due to an internal error. Please try again.',
      );
    }
  }

  /**
   * Handles user registration.
   * Creates a new user and then logs them in by generating a JWT.
   * @param registerUserDto - Data for user registration.
   * @returns An object containing the access token and user details.
   */
  async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    // The UsersService.create method already handles password hashing and checking for existing email.
    // It returns Omit<User, 'password'>
    const newUser = await this.usersService.create(registerUserDto);

    // After successful registration, directly log the user in by generating a token
    const payload = {
      username: newUser.email,
      sub: newUser.id,
      role: newUser.role,
    };

    try {
      const accessToken = this.jwtService.sign(payload);
      return {
        accessToken: accessToken,
        user: newUser, // newUser is already Omit<User, 'password'>
      };
    } catch (error) {
      console.error('Error signing JWT after registration:', error);
      // Potentially, you might want to handle user creation rollback or just inform the user
      // that registration was successful but login failed. For simplicity, we throw an error.
      throw new InternalServerErrorException(
        'Registration successful, but login failed. Please try logging in manually.',
      );
    }
  }
}
