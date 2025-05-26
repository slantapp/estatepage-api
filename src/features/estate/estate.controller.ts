import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { EstateService } from './estate.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import jsonResponse from 'src/common/utils/lib';
import { stat } from 'fs';
import { StatusCodes } from 'http-status-codes';

@Controller('estate')
export class EstateController {
  constructor(private readonly estateService: EstateService) { }

  @Post()
  async create(@Body() createEstateDto: CreateEstateDto, @Res() res: Response) {
    try {
      const estate = await this.estateService.create(createEstateDto);
      jsonResponse(StatusCodes.CREATED, estate, res, 'Estate created successfully');
    } catch (error) {
      // You can customize this error handling as needed
      jsonResponse(
        error.status || StatusCodes.CONFLICT,
        null,
        res,
        error.message || 'Failed to create estate'
      );
    }
  }

  @Get()
  findAll() {
    return this.estateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estateService.getEstateProfile(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstateDto: UpdateEstateDto) {
    return this.estateService.update(+id, updateEstateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estateService.remove(+id);
  }
}
