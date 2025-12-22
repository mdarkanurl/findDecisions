// auth/auth.service.ts
import { Injectable } from "@nestjs/common";
import { auth } from "../lib/auth";

@Injectable()
export class AuthService {
  async signUp(name: string, email: string, password: string) {
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      asResponse: true,
    });
    return response;
  }

  async signIn(email: string, password: string) {
    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    return response;
  }

  async signOut(tokens: { sessionToken: string }) {
    await auth.api.signOut({
      headers: { Authorization: `Bearer ${tokens.sessionToken}` },
      asResponse: true,
    });
  }


  async getSession(headers: Headers) {
    const session = await auth.api.getSession({ headers });
    return session;
  }
}
