import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { EstateServiceService } from './estate-service.service';
import { CreateEstateServiceDto } from './dto/create-estate-service.dto';
import { UpdateEstateServiceDto } from './dto/update-estate-service.dto';

@Controller('service')
export class EstateServiceController {
  constructor(private readonly estateServiceService: EstateServiceService) {}

  @Post()
  create(@Body() createEstateServiceDto: CreateEstateServiceDto) {
    return this.estateServiceService.create(createEstateServiceDto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const estateId = req.query.estateId;
    return this.estateServiceService.findAllServiceForAdmin(page, limit, estateId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estateServiceService.findServiceById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstateServiceDto: UpdateEstateServiceDto) {
    return this.estateServiceService.update(id, updateEstateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estateServiceService.remove(id);
  }
}
