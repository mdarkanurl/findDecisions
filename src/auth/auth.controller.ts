import { Controller, Post, Body, Req, Res, Headers, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(
    @Body() body: { name: string, email: string; password: string },
    @Res() res: Response,
  ) {
    console.log("Is it reach here!");
    const response = await this.authService.signUp(body.name, body.email, body.password);

    // Better Auth may return cookies in the HTTP response — so you need
    // to forward them correctly in NestJS
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(response.body);
  }

  @Post("login")
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const response = await this.authService.signIn(body.email, body.password);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(response.body);
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionToken = req.cookies["session"];
    await this.authService.signOut({ sessionToken });
    res.clearCookie("session");
    return res.json({ success: true });
  }

  @Get("me")
  async me(@Headers() headers: any) {
    const session = await this.authService.getSession(headers);
    return session;
  }
}
