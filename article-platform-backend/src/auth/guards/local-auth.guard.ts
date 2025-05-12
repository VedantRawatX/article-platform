// src/auth/guards/local-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Specify 'local' strategy
  // canActivate is called before the route handler.
  // The base AuthGuard('local') handles the core logic of invoking the local strategy.
  // You can override canActivate for custom logic if needed, e.g., logging.
  // For basic use, just extending AuthGuard('local') is often enough.

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('LocalAuthGuard: Activating...'); // For debugging
    // Add custom logic here before calling super.canActivate(context)
    // For example, you could check for specific headers or conditions.

    // Call the super.canActivate() to execute the default Passport 'local' strategy logic
    const result = super.canActivate(context);

    // Add custom logic here after Passport strategy execution (if needed)
    // For example, logging the outcome.
    // if (result instanceof Promise) {
    //   result.then(can => console.log(`LocalAuthGuard: Can activate? ${can}`))
    //         .catch(() => console.log('LocalAuthGuard: Activation failed (Promise rejected)'));
    // } else if (typeof result === 'boolean') {
    //   console.log(`LocalAuthGuard: Can activate? ${result}`);
    // }

    return result;
  }

  // You can also override handleRequest for custom error handling or response modification
  // handleRequest(err, user, info, context, status) {
  //   if (err || !user) {
  //     // console.error('LocalAuthGuard: Authentication error or no user:', err, info);
  //     throw err || new UnauthorizedException('Custom message from LocalAuthGuard handleRequest');
  //   }
  //   return user; // This user object is what gets attached to request.user
  // }
}
