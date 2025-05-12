    // src/auth/auth.service.ts
    import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common'; // Added Logger
    import { UsersService } from '../users/users.service';
    import { JwtService } from '@nestjs/jwt';
    import * as bcrypt from 'bcrypt';
    import { LoginUserDto } from './dto/login-user.dto';
    import { RegisterUserDto } from './dto/register-user.dto';
    import { User } from '../users/entities/user.entity';

    export interface AuthResponse {
      accessToken: string;
      user: Omit<User, 'password'>;
    }

    @Injectable()
    export class AuthService {
      private readonly logger = new Logger(AuthService.name); // Added logger

      constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
      ) {}

      /**
       * Validates a user based on email and password.
       * Used by the LocalStrategy.
       * @param email - User's email.
       * @param pass - User's plain text password from login form.
       * @returns The user object (without password) if validation is successful, otherwise null.
       */
      async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findByEmail(email);

        this.logger.debug(`Validating user: ${email}`);
        if (!user) {
          this.logger.warn(`User not found: ${email}`);
          return null;
        }

        // Log the state of passwords before comparison
        this.logger.debug(`Password from form (type: ${typeof pass}): ${pass ? 'Exists' : 'MISSING/EMPTY'}`);
        this.logger.debug(`User's stored password hash (type: ${typeof user.password}): ${user.password ? 'Exists' : 'MISSING/EMPTY'}`);

        // Ensure both password from form and stored hash are valid strings before comparing
        if (typeof pass !== 'string' || typeof user.password !== 'string' || !user.password) {
            this.logger.error('Invalid arguments for bcrypt.compare: password from form or stored hash is not a valid string or is missing.');
            if (!user.password) {
                this.logger.error(`Stored password for user ${email} is missing or invalid in the database.`);
            }
            return null; // Or throw an error indicating a problem
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
          this.logger.debug(`Password match for user: ${email}`);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...result } = user;
          return result;
        } else {
          this.logger.warn(`Password mismatch for user: ${email}`);
        }
        return null;
      }

      /**
       * Handles user login.
       * Assumes user object is already validated (e.g., by LocalStrategy).
       * @param user - The validated user object (Omit<User, 'password'>).
       * @returns An object containing the access token and user details.
       */
      async login(user: Omit<User, 'password'>): Promise<AuthResponse> {
        // 'user' here is the result from validateUser (which LocalStrategy calls)
        // It should already be Omit<User, 'password'>
        if (!user || !user.id || !user.email || !user.role) {
            this.logger.error('AuthService.login called with invalid user object:', user);
            throw new InternalServerErrorException('Login failed due to an internal error processing user data.');
        }
        const payload = {
          username: user.email,
          sub: user.id,
          role: user.role,
          firstName: user.firstName, // Include names in JWT payload
          lastName: user.lastName,
        };
        try {
          const accessToken = this.jwtService.sign(payload);
          return {
            accessToken: accessToken,
            user: user, // Return the Omit<User, 'password'> object
          };
        } catch (error) {
            this.logger.error('Error signing JWT during login:', error.stack);
            throw new InternalServerErrorException('Login failed due to an internal error generating token.');
        }
      }

      async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
        const newUser = await this.usersService.create(registerUserDto); // This returns Omit<User, 'password'>
        // After successful registration, directly log the user in by generating a token
        return this.login(newUser); // Reuse the login method to generate token and response
      }
    }
    