import { Injectable } from '@nestjs/common';
import { CreateEstateServiceDto } from './dto/create-estate-service.dto';
import { UpdateEstateServiceDto } from './dto/update-estate-service.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstateServiceService {

  constructor(private prisma: PrismaService) { }


  /**
   * @description Creates a new estate service.
   * @param createEstateServiceDto - The data transfer object containing the details of the estate service to be created.
   * @returns  {Promise<EstateService>} The created estate service object.
   */
  async create(createEstateServiceDto: CreateEstateServiceDto) {
    // 1. Check if service with the same name already exists for this estate
    const existingService = await this.prisma.service.findFirst({
      where: {
        name: createEstateServiceDto.name,
        estateId: createEstateServiceDto.estateId,
      },
    });
    if (existingService) {
      throw new Error('Service with this name already exists for this estate');
    }

    // 2. Create the service (template) for the estate
    const service = await this.prisma.service.create({
      data: {
        ...createEstateServiceDto,
      },
    });

    // 3.   notify users in the estate

    // 4. Return the created service
    return service;
  }


  /**
   * @description Retrieves all services for an admin with pagination.
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of services to return per page (default is 10).
   * @returns An object containing the list of services, total count, total pages, and current page.
   */
  async findAllServiceForAdmin(page = 1, limit = 10, estateId?: string) {
    const skip = (page - 1) * limit;
    const [services, totalCount] = await Promise.all([
      this.prisma.service.findMany(

        {
          where: estateId ? { estateId } : {},
          include: {
            estate: true,
          },
          skip: skip,
          take: limit,
        }),
      this.prisma.service.count(),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
      services,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * @description Retrieves all services for a specific estate with pagination.
   * @param estateId - The ID of the estate to retrieve services for.
   * @param id - The unique identifier of the service to be retrieved.
   * @returns 
   */

  findServiceById(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        estate: true,
      },
    });
  }


  /**
   * @description Updates an existing service by its ID.
   * @param id - The unique identifier of the service to be updated.
   * @param updateEstateServiceDto 
   * @returns 
   */
  async update(id: string, updateEstateServiceDto: UpdateEstateServiceDto) {
         const estateId = updateEstateServiceDto.estateId;

    // 1. Check if the service exists
    const existingService = await this.prisma.service.findUnique({
      where: { id, estateId  },
    });
    if (!existingService) {
      throw new Error('Service not found');
    }

    // 2. Update the service with the provided data
    const updatedService = await this.prisma.service.update({
      where: { id },
      data: updateEstateServiceDto,
    });

    // 3. Return the updated service
    return updatedService;
  }



  /**
   * @description Deletes a service by its ID.
   * @param id  - The unique identifier of the service to be deleted.
   * @returns  { message: string } - A success message indicating the service has been deleted.
   */
  async remove(id: string) {
    // 1. Check if the service exists
    const existingService = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!existingService) {
      throw new Error('Service not found');
    }
    // 2. Delete the service
    await this.prisma.service.delete({
      where: { id },
    });
    // 3. Return a success message
    return { message: 'Service deleted successfully' };
  }
}
