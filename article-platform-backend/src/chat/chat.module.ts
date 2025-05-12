    // File: src/chat/chat.module.ts (Backend)
    import { Module, Logger } from '@nestjs/common';
    import { ChatGateway } from './chat.gateway';
    import { AuthModule } from '../auth/auth.module'; // Import AuthModule to access JwtService
    import { UsersModule } from '../users/users.module'; // Import UsersModule if needed for user details

    @Module({
      imports: [
        AuthModule, // Make JwtService available for injection
        UsersModule, // If you need to fetch more user details via UsersService
      ],
      providers: [
        ChatGateway,
        Logger,
      ],
    })
    export class ChatModule {}
    