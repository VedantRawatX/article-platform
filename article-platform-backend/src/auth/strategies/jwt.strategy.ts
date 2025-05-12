// src/auth/strategies/jwt.strategy.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service'; // To fetch full user object if needed
import { User } from '../../users/entities/user.entity'; // For type hints

// Define the structure of the JWT payload we expect
export interface JwtPayload {
  username: string; // Corresponds to user's email
  sub: string; // Corresponds to user's ID (subject)
  role: string; // User's role
  iat?: number; // Issued at (timestamp) - automatically added by jwt.sign
  exp?: number; // Expiration time (timestamp) - automatically added by jwt.sign
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Strategy by default is 'jwt'
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // Optional: to enrich user object from payload
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      // This will stop the application startup if JWT_SECRET is not set,
      // which is good for security and catching configuration errors early.
      throw new InternalServerErrorException(
        'JWT_SECRET is not defined in the environment variables. Please ensure it is set.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts JWT from 'Bearer <token>' in Authorization header
      ignoreExpiration: false, // Ensures expired tokens are rejected
      secretOrKey: jwtSecret, // Now guaranteed to be a string
    });
  }

  /**
   * This method is automatically called by Passport after it has verified the JWT's signature
   * and that it hasn't expired.
   * The 'payload' parameter is the decoded JWT payload.
   * @param payload - The decoded JWT payload.
   * @returns The user object (or just the payload) to be attached to request.user.
   * @throws UnauthorizedException if user not found or any other validation fails.
   */
  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    // The payload contains { username (email), sub (id), role, iat, exp }
    // We trust the payload at this point because the token's signature has been verified.

    // You can choose to return just the payload, or fetch the full user object
    // from the database for more up-to-date information.
    // Fetching the user ensures the user still exists and hasn't been, e.g., deactivated.

    console.log(
      `JwtStrategy: Validating JWT for user ID ${payload.sub} (email: ${payload.username})`,
    ); // For debugging

    const user = await this.usersService.findById(payload.sub); // Use 'sub' which is the user ID

    if (!user) {
      throw new UnauthorizedException(
        'User from JWT payload not found or invalid.',
      );
    }

    // Optionally, you might check if the user's role in the payload matches the current role in DB,
    // or if the user account is active, etc.

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result; // This will be attached to request.user
    // Ensure this matches what your guards/decorators expect.
    // If you only need payload.sub and payload.role, you could return a simpler object.
  }
}
