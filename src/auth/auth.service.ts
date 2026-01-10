import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable
} from "@nestjs/common";
import { auth } from "../lib/auth";
import { CreateUserDto } from "./dto/create.signUpEmail.dto";
import { loginSchemaDto } from "./dto/create.login.dto";
import { verifyEmailDto } from "./dto/create.email-verification.dto";
import { resendVerifyEmailSchemaDto } from "./dto/create.resend-email-verification.dto";
import { PrismaService } from "../prisma/prisma.service";
import { redis } from "../redis";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signUp(body: CreateUserDto) {
    try {
      const user = await auth.api.signUpEmail({
        body,
        asResponse: true,
      });

      if(user.status === 422) {
        throw new ConflictException('User already exists');
      }

      if(user.status === 400) {
        throw new BadRequestException('Password is too short');
      }

      return user;
    } catch (error) {
      throw error;
    }
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

      const cookie = result.headers.get('set-cookie');
      return cookie;
    } catch (error) {
      throw error;
    }
  }

  async login(
    body: loginSchemaDto,
    req: Request
  ) {
    try {
      const res = await auth.api.signInEmail({
        body,
        asResponse: true,
        headers: req.headers as any
      });

      if(res.status === 401) {
        throw new BadRequestException(
          "User not found or invalid password"
        );
      }

      if(res.status === 403) {
        throw new HttpException("Email not verifyed", res.status)
      }

      const cookie = res.headers.get('set-cookie');
      return cookie;
    } catch (error) {
      throw error;
    }
  }

  async resendVerifyEmail(data: resendVerifyEmailSchemaDto) {
    try {
      // Check User Existence and Verification Status
      const user = await this.prisma.user.findUnique({
        where: {
          email: data.email,
          emailVerified: false
        }
      });

      if(!user) {
        throw new BadRequestException(
          "Account already verified or account doesn't exist"
        );
      }

      const dataFromRedis = await redis.get(`sendVerificationEmail:${user.id}`);
      if(dataFromRedis) {
        throw new BadRequestException("Previous token is not expired");
      }

      const res = await auth.api.sendVerificationEmail({
        body: {
          email: data.email,
          callbackURL: "/"
        }
      });

      if(!res.status) {
        throw new HttpException("Failed to send email", 500);
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await auth.api.signOut()
    } catch (error) {
      throw error;
    }
  }
}
