import { Controller } from '@nestjs/common';
import { DecisionsService } from './decisions.service';

@Controller({ path: 'decisions', version: '1' })
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}
  
}
