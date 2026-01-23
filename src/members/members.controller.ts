import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Res,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { membersService } from './members.service';

@Controller({ path: 'members', version: '1' })
export class membersController {
  constructor(private readonly membersService: membersService) {}
  
}
