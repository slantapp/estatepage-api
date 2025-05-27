import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, Res, UseGuards } from '@nestjs/common';
import { EstateServiceService } from './estate-service.service';
import { CreateEstateServiceDto } from './dto/create-estate-service.dto';
import { UpdateEstateServiceDto } from './dto/update-estate-service.dto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jsonResponse from 'src/common/utils/lib';
import { json } from 'stream/consumers';
import { JwtAuthGuard } from '../auth/guard/JWT-auth.guard';
import { RolesGuard } from '../auth/guard/auth.guard';
import { Roles } from '../auth/strategies/role.strategy';
import { UserRoles } from 'src/common/enums/enums';

@Controller('service')
export class EstateServiceController {
  constructor(private readonly estateServiceService: EstateServiceService) { }

  @Post('/')
  async create(@Body() createEstateServiceDto: CreateEstateServiceDto, @Res() res: Response) {
    try {
      const service = await this.estateServiceService.create(createEstateServiceDto);
      jsonResponse(StatusCodes.CREATED, service, res, 'Service created successfully');

    } catch (error) {
      // You can customize this error handling as needed
      jsonResponse(
        error.status || StatusCodes.CONFLICT,
        null,
        res,
        error.message || 'Failed to create service'
      );

    }
  }

  @Get('/')
  findAll(@Req() req: any, @Query() query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const estateId = req.query.estateId;
    return this.estateServiceService.findAllService(page, limit, estateId);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.estateServiceService.findServiceById(id);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Patch('/:serviceId')
  async update(@Param('serviceId') serviceId: string, @Body() updateEstateServiceDto: UpdateEstateServiceDto, @Res() res: Response) {
    try {
      const updatedService = await this.estateServiceService.update(serviceId, updateEstateServiceDto);
      jsonResponse(StatusCodes.OK, updatedService, res, 'Service updated successfully');

    } catch (error) {
      // You can customize this error handling as needed
      jsonResponse(
        error.status || StatusCodes.NOT_FOUND,
        null,
        res,
        error.message || 'Failed to update service'
      );

    }
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.estateServiceService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:estateId')
  async fetchAllServicesForUserInEstate(
    @Req() req: Request,
    @Param('estateId') estateId: string,
    @Query('status') status?: 'COMPLETED' | 'PENDING' | 'FAILED',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.id; // Assuming user ID is stored in the request object
    const result = await this.estateServiceService.fetchAllServicesForUserInEstate(
      estateId,
      userId,
      status,
      Number(page),
      Number(limit),
    );

    return {
      message: 'Fetched services for user in estate successfully',
      data: result,

    };
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get('/admin/payment-activities/:estateId')
  async fetchServicesPaymentActivities(
    @Req() req: Request,
    @Param('estateId') estateId: string,
    @Query('status') status?: 'COMPLETED' | 'PENDING' | 'FAILED',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    
    const result = await this.estateServiceService.fetchAllPaymentStatusesForAllUsersInEstate(
      estateId,
      status,
      Number(page),
      Number(limit),
    );

    return {
      message: 'Fetched services for user in estate successfully',
      data: result,

    };
  }
}
