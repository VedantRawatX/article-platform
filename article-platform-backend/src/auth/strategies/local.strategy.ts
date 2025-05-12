// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity'; // For type hint

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // Strategy by default is 'local'
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Tell passport-local to use 'email' field as username
      // passwordField: 'password' // 'password' is the default, so this is optional
    });
  }

  /**
   * This method is automatically called by Passport when the local strategy is used.
   * It receives the credentials (email and password) from the request.
   * @param email - The email provided by the user.
   * @param password - The password provided by the user.
   * @returns The user object (without password) if authentication is successful.
   * @throws UnauthorizedException if authentication fails.
   */
  async validate(email: string, pass: string): Promise<Omit<User, 'password'>> {
    console.log(`LocalStrategy: Validating user ${email}`); // For debugging
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials provided to LocalStrategy.',
      );
    }
    return user; // This user object will be attached to request.user
  }
}
