import { Controller, Post, Body, Req, Res, Headers, Get, HttpStatus, HttpCode, Query, BadRequestException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CreateUserDto } from "./dto/create.signUpEmail.dto";

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('signup')
  @AllowAnonymous()
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
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

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
}
