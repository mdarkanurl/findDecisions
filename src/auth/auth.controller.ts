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
  Session,
  HttpException,
  InternalServerErrorException
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CreateUserDto, createUserSchema } from "./dto/create.signUpEmail.dto";
import { loginSchema, loginSchemaDto } from "./dto/create.login.dto";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { verifyEmailDto, verifyEmailSchema } from "./dto/create.email-verification.dto";

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('signup')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async signup(@Body() body: CreateUserDto, @Res() res: Response) {
    await this.authService.signUp(body);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "User created",
      data: null,
      error: null
    });
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
      const setCookieHeader = await this.authService.verifyEmail(token, req);

      if (setCookieHeader) {
        res.setHeader('Set-Cookie', setCookieHeader);
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Email verified successfully",
        data: null,
        error: null
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Email verification failed' );
    }
  }


  @Post('login')
  @AllowAnonymous()
  @UsePipes(new ZodValidationPipe(loginSchema))
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: loginSchemaDto) {
    try {
      await this.authService.login(body);
    } catch (error) {
      
    }
  }
}
