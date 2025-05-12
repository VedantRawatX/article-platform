// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Reflector is used to read metadata
import { UserRole } from '../../users/entities/user.entity'; // Adjust path as needed
import { ROLES_KEY } from '../decorators/roles.decorator'; // Key for roles metadata
import { User } from '../../users/entities/user.entity'; // For typing req.user

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the @Roles() decorator for the current route handler
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Method-scoped roles
        context.getClass(), // Controller-scoped roles (if any)
      ],
    );

    // If no roles are defined for the route, allow access (or deny, based on your default policy)
    // For admin-only sections, it's safer to deny if no roles are specified,
    // but often, if @Roles is not present, it means no specific role check beyond authentication.
    // Here, if @Roles is not used, we allow. If @Roles is used with an empty array, it would deny.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Or false if your policy is to deny by default if no roles are set
    }

    // 2. Get the user object from the request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user as User; // Assuming JwtAuthGuard populates req.user with the User entity

    // If there's no user object (e.g., JwtAuthGuard didn't run or failed), deny access
    if (!user || !user.role) {
      // This case should ideally be caught by JwtAuthGuard first.
      throw new ForbiddenException(
        'You do not have the necessary permissions (user data missing).',
      );
    }

    // 3. Check if the user's role matches any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (hasRequiredRole) {
      return true; // User has one of the required roles
    } else {
      // User does not have the required role
      throw new ForbiddenException(
        `You do not have the necessary permissions. Required role(s): ${requiredRoles.join(', ')}.`,
      );
    }
  }
}
