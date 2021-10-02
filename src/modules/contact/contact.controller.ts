import { GetContactsDto } from './dto/get-contacts.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { ContactService } from './contact.service';

@Controller('contacts')
@Auth()
@ApiTags('Contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async findAll(@Query() data: GetContactsDto) {
    return this.contactService.findAll(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }
}
