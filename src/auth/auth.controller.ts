import { Controller, Post, Body, Req, Res, Headers, Get, HttpStatus, HttpCode, Query, BadRequestException, UsePipes } from "@nestjs/common";
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
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: verifyEmailDto) {
    try {
      await this.authService.verifyEmail(token);

      return {
        success: true,
        message: 'Email verified successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Email verification failed',
      );
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
