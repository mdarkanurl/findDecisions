import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ path: 'decisions', version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  createDecisions(): string {
    return this.appService.getHello();
  }
}
