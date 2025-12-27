import { Controller, Post, Body, Req, Res, Headers, Get, HttpStatus, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
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
    const response = await this.authService.signUp(body);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "User created",
      data: null,
      error: null
    });
  }
}
