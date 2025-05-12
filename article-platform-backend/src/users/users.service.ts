// src/users/users.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt'; // Import bcrypt
import { RegisterUserDto } from '../auth/dto/register-user.dto'; // Import RegisterUserDto

@Injectable()
export class UsersService {
  private readonly saltRounds = 10; // Or store in config

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by their email address.
   * Primarily used by the authentication process.
   * @param email - The email of the user to find.
   * @returns The found user, or undefined if not found.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return user || undefined; // Explicitly return undefined if user is null
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new InternalServerErrorException('Error accessing user data.');
    }
  }

  /**
   * Finds a user by their ID.
   * @param id - The UUID of the user to find.
   * @returns The found user.
   * @throws NotFoundException if no user is found.
   */
  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        // user will be null if not found
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(`Error finding user by ID ${id}:`, error);
      throw new InternalServerErrorException('Error accessing user data.');
    }
  }

  /**
   * Creates a new user with a hashed password.
   * @param registerUserDto - Data for the new user.
   * @returns The created user (without the password).
   * @throws ConflictException if email already exists.
   * @throws InternalServerErrorException on other errors.
   */
  async create(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { email, password, role, firstName, lastName } = registerUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(`User with email "${email}" already exists.`);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, this.saltRounds);
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      throw new InternalServerErrorException(
        'Could not create user due to a security hashing issue.',
      );
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: role || UserRole.USER, // Default to USER if not provided
      firstName,
      lastName,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = savedUser; // Exclude password from the returned object
      return result;
    } catch (error) {
      // Check for unique constraint violation error (specific to PostgreSQL)
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        throw new ConflictException(
          `User with email "${email}" already exists.`,
        );
      }
      console.error('Error creating user in database:', error);
      throw new InternalServerErrorException(
        'Could not save user to the database.',
      );
    }
  }
}
