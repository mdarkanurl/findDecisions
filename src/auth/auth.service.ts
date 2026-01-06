// auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable
} from "@nestjs/common";
import { auth } from "../lib/auth";
import { CreateUserDto } from "./dto/create.signUpEmail.dto";
import { PrismaService } from "../prisma/prisma.service";
import { loginSchemaDto } from "./dto/create.login.dto";
import { verifyEmailDto } from "./dto/create.email-verification.dto";
import { APIError } from "better-auth/api";

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

  async verifyEmail(
    token: verifyEmailDto,
    req: Request
  ) {
    try {
      const result = await auth.api.verifyEmail({
        query: token,
        asResponse: true,
        headers: req.headers as any
      });

      if(result.status === 401) {
        throw new BadRequestException('token expired or invalid');
      } else if(result.status >= 500) {
        throw new HttpException('Server error', 500);
      }

      const setCookieHeader = result.headers.get('set-cookie');
      return setCookieHeader;
    } catch (error) {
      if (error instanceof APIError) {
        const status =
          typeof error.status === 'number' ? error.status : 500;
        throw new HttpException(error.message, status);
      }
      throw new HttpException(`${error}`, 500);
    }
  }

  async login(body: loginSchemaDto) {
    const res = await auth.api.signInEmail({
      body
    });

    console.log(res);
  }
}
