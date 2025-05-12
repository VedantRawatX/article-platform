// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity'; // Adjust path as needed

export const ROLES_KEY = 'roles'; // Key to store roles metadata

/**
 * Decorator to assign roles to a route handler.
 * @param roles - An array of UserRole enums that are allowed to access the route.
 *
 * @example
 * ```ts
 * @Roles(UserRole.ADMIN) // Only admin role
 * @Roles(UserRole.ADMIN, UserRole.EDITOR) // Admin or Editor roles
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
