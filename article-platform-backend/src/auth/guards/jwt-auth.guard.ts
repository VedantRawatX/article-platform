// src/auth/guards/jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Specify 'jwt' strategy
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('JwtAuthGuard: Activating...'); // For debugging
    // Add custom logic here before calling super.canActivate(context)
    return super.canActivate(context);
  }

  // This method is called after the JWT strategy's validate() method.
  // It allows you to customize how errors are handled or how the user object is processed.
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    // err: Error thrown by the strategy (e.g., if token is malformed before validation)
    // user: The user object returned by JwtStrategy.validate() (or false if validation failed within strategy)
    // info: Additional information, often an error message from passport-jwt (e.g., 'No auth token', 'jwt expired')

    // console.log('JwtAuthGuard - handleRequest:', { err, user, info, status }); // For debugging

    if (err || !user) {
      // If there's an error or no user object was returned by the strategy,
      // throw an UnauthorizedException.
      // 'info' might contain details like 'jwt expired' or 'No auth token'
      const message =
        info instanceof Error ? info.message : info?.message || 'Unauthorized';
      // console.error(`JwtAuthGuard: Authentication failed. Info: ${message}`, err);
      throw err || new UnauthorizedException(message);
    }

    // If authentication is successful, 'user' is the object returned by JwtStrategy.validate()
    // This will be attached to request.user
    return user;
  }
}
