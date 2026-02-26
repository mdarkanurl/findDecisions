import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from './../src/auth/auth.controller';
import { AuthServiceLocal } from './../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  const authServiceMock = {
    signUp: jest.fn(),
    logout: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthServiceLocal,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/sign-up/email returns 400 for invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-up/email')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'short',
      });

    expect(response.status).toBe(400);
    expect(authServiceMock.signUp).not.toHaveBeenCalled();
  });

  it('POST /auth/sign-up/email returns 201 for valid payload', async () => {
    authServiceMock.signUp.mockResolvedValue(undefined);

    const payload = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'verysecurepassword',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/sign-up/email')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: 'User created',
      data: null,
      error: null,
    });
    expect(authServiceMock.signUp).toHaveBeenCalledWith(payload);
  });

  it('POST /auth/sign-out returns 400 when session cookie is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-out')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'No session token provided',
    });
    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });
});
