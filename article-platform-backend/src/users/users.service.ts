    // src/users/users.service.ts
    import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository } from 'typeorm';
    import { User, UserRole } from './entities/user.entity';
    import * as bcrypt from 'bcrypt';
    import { RegisterUserDto } from '../auth/dto/register-user.dto';
    import { UpdateProfileDto } from './dto/update-profile.dto';
    import { ChangePasswordDto } from './dto/change-password.dto';

    @Injectable()
    export class UsersService {
      private readonly saltRounds = 10;
      private readonly logger = new Logger(UsersService.name); // Added logger

      constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
      ) {}

      async findByEmail(email: string): Promise<User | undefined> {
        try {
          const user = await this.userRepository.findOne({ where: { email } });
          return user || undefined;
        } catch (error) {
          this.logger.error(`Error finding user by email ${email}: ${error.message}`, error.stack);
          throw new InternalServerErrorException('Error accessing user data.');
        }
      }

      async findById(id: string): Promise<User> {
        try {
          const user = await this.userRepository.findOne({ where: { id } });
          if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found.`);
          }
          return user;
        } catch (error) {
          if (error instanceof NotFoundException) throw error;
          this.logger.error(`Error finding user by ID ${id}: ${error.message}`, error.stack);
          throw new InternalServerErrorException('Error accessing user data.');
        }
      }

      async create(registerUserDto: RegisterUserDto): Promise<Omit<User, 'password'>> {
        const { email, password, role, firstName, lastName } = registerUserDto;

        const existingUserByEmail = await this.userRepository.findOne({ where: { email } });
        if (existingUserByEmail) {
          throw new ConflictException(`User with email "${email}" already exists.`);
        }

        let hashedPassword;
        try {
          hashedPassword = await bcrypt.hash(password, this.saltRounds);
        } catch (hashError) {
            this.logger.error('Error hashing password during creation:', hashError.stack);
            throw new InternalServerErrorException('Could not create user due to a security hashing issue.');
        }

        const user = this.userRepository.create({
          email,
          password: hashedPassword,
          role: role || UserRole.USER,
          firstName,
          lastName,
        });

        try {
          const savedUser = await this.userRepository.save(user);
          const { password: _, ...result } = savedUser; // eslint-disable-line @typescript-eslint/no-unused-vars
          return result;
        } catch (error) {
          if (error.code === '23505') { // PostgreSQL unique violation
             throw new ConflictException(`User with email "${email}" already exists.`);
          }
          this.logger.error('Error creating user in database:', error.stack);
          throw new InternalServerErrorException('Could not save user to the database.');
        }
      }

      /**
       * Updates a user's profile information (firstName, lastName, email).
       * Uses a targeted update to avoid affecting other fields like password.
       * @param userId - The ID of the user to update.
       * @param updateProfileDto - The data to update.
       * @returns The updated user object (without password).
       */
      async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
        const userToUpdate = await this.findById(userId); // Ensures user exists

        const updatePayload: Partial<User> = {};

        // Check and prepare firstName for update
        if (updateProfileDto.firstName !== undefined && updateProfileDto.firstName !== userToUpdate.firstName) {
          updatePayload.firstName = updateProfileDto.firstName;
        }
        // Check and prepare lastName for update
        if (updateProfileDto.lastName !== undefined && updateProfileDto.lastName !== userToUpdate.lastName) {
          updatePayload.lastName = updateProfileDto.lastName;
        }
        // Check and prepare email for update, including uniqueness check
        if (updateProfileDto.email && updateProfileDto.email !== userToUpdate.email) {
          const existingUserWithNewEmail = await this.findByEmail(updateProfileDto.email);
          if (existingUserWithNewEmail && existingUserWithNewEmail.id !== userId) {
            throw new ConflictException(`Email "${updateProfileDto.email}" is already in use by another account.`);
          }
          updatePayload.email = updateProfileDto.email;
        }

        // If no actual changes are being made, return the current user data
        if (Object.keys(updatePayload).length === 0) {
          this.logger.debug(`No profile changes to persist for user ${userId}.`);
          const { password, ...result } = userToUpdate; // eslint-disable-line @typescript-eslint/no-unused-vars
          return result;
        }

        this.logger.debug(`Updating profile for user ${userId} with payload: ${JSON.stringify(updatePayload)}`);

        try {
          await this.userRepository.update(userId, updatePayload);
          // Re-fetch the user to get the updated entity and ensure data consistency
          const updatedUser = await this.findById(userId);
          const { password, ...result } = updatedUser; // eslint-disable-line @typescript-eslint/no-unused-vars
          return result;
        } catch (error) {
          this.logger.error(`Error updating profile for user ${userId}: ${error.message}`, error.stack);
          if (error.code === '23505' && error.detail?.includes('email')) {
             throw new ConflictException(`Email "${updateProfileDto.email}" is already in use.`);
          }
          throw new InternalServerErrorException('Could not update profile.');
        }
      }

      async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.findById(userId);

        const isCurrentPasswordValid = await bcrypt.compare(
          changePasswordDto.currentPassword,
          user.password, // This is the current hashed password from DB
        );

        if (!isCurrentPasswordValid) {
          throw new UnauthorizedException('Incorrect current password.');
        }

        const isNewPasswordSameAsOld = await bcrypt.compare(
          changePasswordDto.newPassword,
          user.password, // Compare new plain password with old hashed password
        );
        if (isNewPasswordSameAsOld) {
          throw new BadRequestException('New password cannot be the same as the old password.');
        }

        let newHashedPassword;
        try {
          newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, this.saltRounds);
        } catch (hashError) {
            this.logger.error('Error hashing new password:', hashError.stack);
            throw new InternalServerErrorException('Could not change password due to a security hashing issue.');
        }

        // user.password = newHashedPassword; // Don't modify the fetched user directly if using .update()
        // await this.userRepository.save(user); // Avoid saving the whole entity

        try {
          await this.userRepository.update(userId, { password: newHashedPassword });
          this.logger.log(`Password changed successfully for user ${userId}.`);
        } catch (error) {
          this.logger.error(`Error saving new password for user ${userId}: ${error.message}`, error.stack);
          throw new InternalServerErrorException('Could not change password.');
        }
      }
    }
    