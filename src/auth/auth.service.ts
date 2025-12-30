// auth/auth.service.ts
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { auth } from "../lib/auth";
import { CreateUserDto } from "./dto/create.signUpEmail.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signUp(body: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return await auth.api.signUpEmail({
      body,
      asResponse: true,
    });
  }

  async verifyEmail(token: string) {
    try {
      const result = await auth.api.verifyEmail({
        query: { token },
      });

      return result;
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
}
