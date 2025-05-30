import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstateServiceDto } from './dto/create-estate-service.dto';
import { UpdateEstateServiceDto } from './dto/update-estate-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Not } from 'typeorm';
import { calculateDueDate } from 'src/common/utils/date.utils';

@Injectable()
export class EstateServiceService {

  constructor(private prisma: PrismaService) { }


  /**
   * @description Creates a new estate service.
   * @param createEstateServiceDto - The data transfer object containing the details of the estate service to be created.
   * @returns  {Promise<EstateService>} The created estate service object.
   */
  async create(createEstateServiceDto: CreateEstateServiceDto) {
    try {
      // 1. Check if service with the same name already exists for this estate
      const existingService = await this.prisma.service.findFirst({
        where: {
          name: createEstateServiceDto.name,
          estateId: createEstateServiceDto.estateId,
        },
      });
      if (existingService) {
        throw new ConflictException('Service with this name already exists for this estate');
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
    } catch (error) {

      if (error instanceof ConflictException) {
        throw error; // Re-throw the conflict exception
      }
      throw new Error('Failed to create service: ' + error.message);
    }
  }


  /**
   * @description Retrieves all services for an admin with pagination.
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of services to return per page (default is 10).
   * @returns An object containing the list of services, total count, total pages, and current page.
   */
  async findAllService(page = 1, limit = 10, estateId?: string) {
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

  async fetchAllServicesForUserInEstate(
    estateId: string,
    userId: string,
    filterStatus?: 'completed' | 'pending' | 'failed',
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    // Step 1: Fetch all services in the estate
    const services = await this.prisma.service.findMany({
      where: {
        estateId,
      },
      skip,
      take: limit,
    });

    // Step 2: For each service, get user-specific payment if it exists
    const enriched = await Promise.all(
      services.map(async (service) => {
        const payment = await this.prisma.payment.findFirst({
          where: {
            serviceId: service.id,
            userId,
          },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            paymentReference: true,
          },
        });

        return {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          billingCycle: service.billingCycle,
          serviceStatus: service.isActive,
          status: payment?.status ?? 'pending',
          paymentDetails: payment ?? null,
        };
      }),
    );

    // Step 3: Filter if needed
    const filtered = filterStatus
      ? enriched.filter((s) => s.status === filterStatus)
      : enriched;

    // Step 4: Get total count of services in estate
    const total = await this.prisma.service.count({
      where: { estateId },
    });

    return {
      services: filtered,
      total,
      page,
      limit,
    };
  }



  /**
   * @description Fetches all payment statuses for all users in a specific estate.
   * @param estateId - The ID of the estate to fetch payment statuses for.
   * @param filterStatus - Optional filter for payment status (COMPLETED, PENDING, FAILED).
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of records to return per page (default is 10).
   * @returns An object containing the payment status matrix, total count, current page, and limit.
   */

  async fetchAllPaymentStatusesForAllUsersInEstate(
    estateId: string,
    filterStatus?: 'completed' | 'pending' | 'failed',
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    // Fetch all services in the estate
    const services = await this.prisma.service.findMany({
      where: { estateId },
      select: {
        id: true,
        name: true,
        billingCycle: true,
        isActive: true,
        createdAt: true,
        price: true,
        endDate: true, // Assuming endDate is a field in the service model

      },
    });

    // Fetch all users in the estate
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,

      },
    });

    // Fetch all payments in this estate (to map easily)
    const payments = await this.prisma.payment.findMany({
      where: {
        service: { estateId },
      },
      select: {
        id: true,
        userId: true,
        serviceId: true,
        status: true,
        amount: true,
        paymentReference: true,
        createdAt: true,
      },
    });

    // Create a map of payments by `${userId}_${serviceId}`
    const paymentMap = new Map<string, typeof payments[number]>();
    payments.forEach((p) => {
      paymentMap.set(`${p.userId}_${p.serviceId}`, p);
    });

    const matrix = services.flatMap((service) => {
      return users.map((user) => {
        const key = `${user.id}_${service.id}`;
        const payment = paymentMap.get(key);

        const status = payment?.status ?? 'pending';

        return {
          id: payment?.id ?? null, // Payment ID if exists, otherwise null
          serviceId: service.id,
          serviceName: service.name,
          billingCycle: service.billingCycle,
          serviceStatus: service.isActive,

          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,

          status,
          paymentDate: payment?.createdAt ?? service.createdAt,
          dueDate: service.endDate,
          amount: payment?.amount ? payment.amount : service.price ,
        };
      });
    });

    // Apply filter if needed
    const filtered = filterStatus
      ? matrix.filter((entry) => entry.status === filterStatus)
      : matrix;

    const total = filtered.length;

    
    // Apply pagination after filtering
    const paginated = filtered.slice(skip, skip + limit);
  

    return {
      payments: paginated,
      total,
      page,
      limit,
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
    try {
      const estateId = updateEstateServiceDto.estateId;

      // 1. Check if the service exists
      const existingService = await this.prisma.service.findUnique({
        where: { id, estateId },
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
    } catch (error) {

      console.error('Error updating service:', error);
      if (error instanceof NotFoundException) {
        throw new Error('Service not found');
      }
      throw new Error('Failed to update service: ' + error.message);
    }
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

  /**
   * @description Returns a summary for each user in the estate: total completed payment and number of pending payments.
   * @param estateId - The ID of the estate.
   * @param page - The page number for pagination (default 1).
   * @param limit - The number of users per page (default 10).
   * @returns Paginated user payment summaries.
   */
  async getAllUsersPaymentSummary(estateId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Fetch all users in the estate except admins
    const users = await this.prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' }, // Exclude admins
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        houseAddress: true,
        createdAt: true,
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await this.prisma.user.count({
      where: {
        role: { not: 'ADMIN' },
      },
    });

    // Fetch all services in the estate
    const services = await this.prisma.service.findMany({
      where: { estateId },
      select: { id: true, price: true },
    });

    // Fetch all payments for these services
    const payments = await this.prisma.payment.findMany({
      where: {
        service: { estateId },
      },
      select: {
        userId: true,
        serviceId: true,
        status: true,
        amount: true,
      },
    });

    // Build a map for quick lookup: userId_serviceId -> payment
    const paymentMap = new Map<string, typeof payments[number]>();
    payments.forEach((p) => {
      paymentMap.set(`${p.userId}_${p.serviceId}`, p);
    });

    // For each user, calculate total completed payment and pending payments count
    const result = users.map((user) => {
      let totalCompletedPayment = 0;
      let pendingPaymentsCount = 0;

      services.forEach((service) => {
        const key = `${user.id}_${service.id}`;
        const payment = paymentMap.get(key);

        if (payment && payment.status === 'completed') {
          totalCompletedPayment += payment.amount;
        } else {
          // If no payment or not completed, count as pending
          pendingPaymentsCount += 1;
        }
      });

      return {
        ...user,
        totalCompletedPayment,
        pendingPaymentsCount,
      };
    });

    return {
      users: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * @description Fetches all payment statuses for a single user in a specific estate.
   * For each service in the estate, returns the payment if it exists, otherwise marks as pending.
   */
  async fetchAllPaymentStatusesForUserInEstate(
    estateId: string,
    userId: string,
  ) {
    // Fetch all services in the estate
    const services = await this.prisma.service.findMany({
      where: { estateId },
      select: {
        id: true,
        name: true,
        billingCycle: true,
        isActive: true,
        createdAt: true,
        price: true,
        endDate: true,
      },
    });

    // Fetch all payments for this user in this estate
    const payments = await this.prisma.payment.findMany({
      where: {
        userId,
        service: { estateId },
      },
      select: {
        id: true,
        userId: true,
        serviceId: true,
        status: true,
        amount: true,
        paymentReference: true,
        createdAt: true,
      },
    });

    // Map payments by serviceId for quick lookup
    const paymentMap = new Map<string, typeof payments[number]>();
    payments.forEach((p) => {
      paymentMap.set(p.serviceId, p);
    });

    // For each service, return payment info or pending
    const result = services.map((service) => {
      const payment = paymentMap.get(service.id);
      const status = payment?.status ?? 'pending';
      return {
        serviceId: service.id,
        serviceName: service.name,
        billingCycle: service.billingCycle,
        serviceStatus: service.isActive,
        userId,
        status,
        paymentDate: payment?.createdAt ?? service.createdAt,
        dueDate: calculateDueDate(service.billingCycle, service.createdAt), // <-- use util
        amount: payment?.amount ?? service.price,
        paymentId: payment?.id ?? null,
      };
    });

    return result;
  }
}
