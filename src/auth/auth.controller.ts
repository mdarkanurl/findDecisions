import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpStatus,
  HttpCode,
  Query,
  UsePipes,
  HttpException,
  InternalServerErrorException
} from "@nestjs/common";
import { AuthServiceLocal } from "./auth.service";
import { Response, Request } from "express";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CreateUserDto, createUserSchema } from "./dto/create.signUpEmail.dto";
import { loginSchema, loginSchemaDto } from "./dto/create.login.dto";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { verifyEmailDto, verifyEmailSchema } from "./dto/create.email-verification.dto";
import { resendVerifyEmailSchema, resendVerifyEmailSchemaDto } from "./dto/create.resend-email-verification.dto";

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthServiceLocal
  ) {}

  @Post('signup')
  @AllowAnonymous()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async signup(@Body() body: CreateUserDto, @Res() res: Response) {
    try {
      await this.authService.signUp(body);

      res.json({
        success: true,
        message: "User created",
        data: null,
        error: null
      });
    } catch (error) {
      if(error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Fail to create user");
    }
  }

  @Get('verify-email')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  async verifyEmail(
    @Query() token: verifyEmailDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.verifyEmail(token, req);

      if (data) {
        res.setHeader('Set-Cookie', data);
      }

      res.json({
        success: true,
        message: "Email verified successfully",
        data: null,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Email verification failed");
    }
  }

  @Post('login')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() body: loginSchemaDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const data = await this.authService.login(body, req);

      if (data) {
        res.setHeader('Set-Cookie', data);
      }

      res.json({
        success: true,
        message: "You've logged in successfully",
        data: null,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Email verification failed");
    }
  }

  @Post('resend-verify-email')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resendVerifyEmailSchema))
  async resendVerifyEmail(
    @Body() body: resendVerifyEmailSchemaDto,
    @Res() res: Response
  ) {
    try {
      await this.authService.resendVerifyEmail(body);

      res.json({
        success: true,
        message: "The email has been sent",
        data: null,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Email verification failed");
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const sessionToken: string = req.cookies['better-auth.session_token'];

      if (!sessionToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'No session token provided',
        });
      }

      await this.authService.logout(sessionToken, req);

      // Clear cookies on response
      res.clearCookie('better-auth.session_token');

      res.json({
        success: true,
        message: "Logged out successfully",
        data: null,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Logout failed");
    }
  }
}
