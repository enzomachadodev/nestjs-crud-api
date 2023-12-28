import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup({ name, email, password }: AuthDto) {
    const passwordHash = await bcrypt.hash(password, 6);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      delete user.passwordHash;

      return { user };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('E-mail is already beign used');
        }
      }

      throw error;
    }
  }

  signin() {
    return 'I am signin';
  }
}
