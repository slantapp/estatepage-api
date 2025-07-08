import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { EstateService } from './estate.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import jsonResponse from 'src/common/utils/lib';
import { stat } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { BulkCreateEstateFeatureDto, CreateEstateFeatureDto } from './dto/create-estate-feature.dto';
import { BulkCreateEstateGalleryDto, CreateEstateGalleryDto } from './dto/create-estate-gallery.dto';
import { BulkCreateEstateStreetDto, CreateEstateStreetDto } from './dto/create-estate-street.dto';

@Controller('estates')
export class EstateController {
  constructor(private readonly estateService: EstateService) { }

  @Post('/create')
  async create(@Body() createEstateDto: CreateEstateDto, @Res() res: Response) {
    console.log('Creating estate with data:', createEstateDto);
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
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const estate = await this.estateService.getEstateProfile(id);
    jsonResponse(StatusCodes.OK, {estate: estate}, res, 'Estate fetched successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEstateDto: UpdateEstateDto, @Res() res: Response) {
    const result= await this.estateService.update(id, updateEstateDto);
    jsonResponse(StatusCodes.OK, {estate: result}, res, 'Estate updated successfully');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estateService.remove(+id);
  }


  // ---- Feature ----
  @Post('feature')
  createFeature(@Body() dto: CreateEstateFeatureDto) {
    return this.estateService.createEstateFeature(dto);
  }

  @Post('bulk-feature')
  createBulkFeature(@Body() dto: BulkCreateEstateFeatureDto) {
    return this.estateService.bulkCreateEstateFeatures(dto);
  }

  @Get(':estateId/features')
  getFeatures(@Param('estateId') estateId: string) {
    return this.estateService.getAllEstateFeatures(estateId);
  }

  // ---- Gallery ----
  @Post('gallery')
  createGallery(@Body() dto: CreateEstateGalleryDto) {
    return this.estateService.createEstateGallery(dto);
  }

  @Post('bulk-gallery')
  createBulkGallery(@Body() dto: BulkCreateEstateGalleryDto) {
    return this.estateService.bulkCreateEstateGallery(dto);
  }

  @Get(':estateId/gallery')
  getGallery(@Param('estateId') estateId: string) {
    return this.estateService.getAllEstateGallery(estateId);
  }

  // ---- Streets ----
  @Post('street')
  createStreet(@Body() dto: CreateEstateStreetDto) {
    return this.estateService.createEstateStreet(dto);
  }

  @Post('bulk-street')
  createBulkStreet(@Body() dto: BulkCreateEstateStreetDto) {
    return this.estateService.bulkCreateEstateStreets(dto);
  }


  @Get(':estateId/streets')
  getStreets(@Param('estateId') estateId: string) {
    return this.estateService.getAllEstateStreets(estateId);
  }


}
