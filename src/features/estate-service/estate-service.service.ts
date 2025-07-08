import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstateServiceDto } from './dto/create-estate-service.dto';
import { UpdateEstateServiceDto } from './dto/update-estate-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../payment/billing.service';
import { calculateDueDate } from 'src/common/utils/date.utils';

@Injectable()
export class EstateServiceService {

  constructor(
    private prisma: PrismaService,
    private billingService: BillingService
  ) { }

  // Helper methods for date calculations
  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  private subMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
  }


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

      // 3. Generate payment records for all users in the estate for this new service
      try {
        await this.generatePaymentsForNewService(service.id, service.estateId);
      } catch (paymentError) {
        console.error('Failed to generate initial payments for new service:', paymentError);
        // Don't fail the service creation if payment generation fails
      }

      // 4. TODO: notify users in the estate about the new service

      // 5. Return the created service
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
      this.prisma.service.count({
        where: estateId ? { estateId } : {},
      }),
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
    filterStatus?: 'COMPLETED' | 'PENDING' | 'FAILED',
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const now = new Date();

    // Step 1: Fetch all services in the estate
    const services = await this.prisma.service.findMany({
      where: {
        estateId,
      },
      skip,
      take: limit,
    });

    // Step 2: For each service, get user-specific payment for current billing period
    const enriched = await Promise.all(
      services.map(async (service) => {
        const payment = await this.prisma.payment.findFirst({
          where: {
            serviceId: service.id,
            userId,
            billingPeriodStart: { lte: now },
            billingPeriodEnd: { gte: now },
          },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            paymentReference: true,
            billingPeriodStart: true,
            billingPeriodEnd: true,
            dueDate: true,
          },
        });

        return {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          billingCycle: service.billingCycle,
          serviceStatus: service.isActive,
          status: payment?.status ?? 'PENDING',
          paymentDetails: payment ?? null,
          currentBillingPeriod: payment ? {
            start: payment.billingPeriodStart,
            end: payment.billingPeriodEnd,
            dueDate: payment.dueDate,
          } : null,
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
    filterStatus?: 'COMPLETED' | 'PENDING' | 'FAILED',
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    // Define monthly date ranges for summary calculations
    const now = new Date();
    const currentMonthStart = this.startOfMonth(now);
    const currentMonthEnd = this.endOfMonth(now);
    const lastMonthStart = this.startOfMonth(this.subMonths(now, 1));
    const lastMonthEnd = this.endOfMonth(this.subMonths(now, 1));

    // Fetch services and users in parallel for better performance
    const [services, users] = await Promise.all([
      this.prisma.service.findMany({
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
      }),
      this.prisma.user.findMany({
        where: {
          role: { not: 'ADMIN' },
          estateId, // Only users in this estate
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      }),
    ]);

    // Early return if no services or users
    if (services.length === 0 || users.length === 0) {
      return {
        payments: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        currentMonthTotalAmount: 0,
        lastMonthTotalAmount: 0,
        summary: {
          totalServices: services.length,
          totalUsers: users.length,
          totalExpectedRevenue: 0,
          completedPaymentsCount: 0,
          pendingPaymentsCount: 0,
        },
      };
    }

    // Fetch all payments for services in this estate
    const payments = await this.prisma.payment.findMany({
      where: {
        service: { estateId },
        userId: { in: users.map(u => u.id) }, // Only payments from users in this estate
      },
      select: {
        id: true,
        userId: true,
        serviceId: true,
        status: true,
        amount: true,
        paymentReference: true,
        createdAt: true,
        dueDate: true, // Include dueDate from payment record
        billingPeriodStart: true,
        billingPeriodEnd: true,
      },
    });

    // Create payment lookup map for O(1) lookups
    const paymentMap = new Map<string, typeof payments[number]>();
    payments.forEach((p) => {
      paymentMap.set(`${p.userId}_${p.serviceId}`, p);
    });

    // Build the payment matrix
    const matrix = services.flatMap((service) => {
      return users.map((user) => {
        const key = `${user.id}_${service.id}`;
        const payment = paymentMap.get(key);

        // Use payment status if exists, otherwise default to PENDING
        const status = payment?.status ?? 'PENDING';

        return {
          id: payment?.id ?? null,
          serviceId: service.id,
          serviceName: service.name,
          billingCycle: service.billingCycle,
          serviceStatus: service.isActive,
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          status,
          paymentDate: payment?.createdAt ?? null,
          dueDate: payment?.dueDate ?? null, // Use actual due date from payment record
          amount: payment?.amount ?? service.price,
          paymentReference: payment?.paymentReference ?? null,
          billingPeriod: payment ? {
            start: payment.billingPeriodStart,
            end: payment.billingPeriodEnd,
          } : null,
        };
      });
    });

    // Apply status filter if provided
    const filtered = filterStatus
      ? matrix.filter((entry) => entry.status === filterStatus)
      : matrix;

    const total = filtered.length;

    // Calculate completed payments for monthly totals
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');

    const currentMonthTotalAmount = completedPayments
      .filter(p => p.createdAt >= currentMonthStart && p.createdAt <= currentMonthEnd)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const lastMonthTotalAmount = completedPayments
      .filter(p => p.createdAt >= lastMonthStart && p.createdAt <= lastMonthEnd)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Apply pagination
    const paginated = filtered.slice(skip, skip + limit);

    return {
      payments: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      currentMonthTotalAmount,
      lastMonthTotalAmount,
      summary: {
        totalServices: services.length,
        totalUsers: users.length,
        totalExpectedRevenue: services.reduce((sum, s) => sum + s.price, 0) * users.length,
        completedPaymentsCount: completedPayments.length,
        pendingPaymentsCount: matrix.filter(m => m.status === 'PENDING').length,
      },
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
        estateId, // Only users in this estate
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
        estateId, // Only users in this estate
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

        if (payment && payment.status === 'COMPLETED') {
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
        dueDate: true, // Include dueDate from payment record
        billingPeriodStart: true,
        billingPeriodEnd: true,
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
      const status = payment?.status ?? 'PENDING';
      return {
        serviceId: service.id,
        serviceName: service.name,
        billingCycle: service.billingCycle,
        serviceStatus: service.isActive,
        userId,
        status,
        paymentDate: payment?.createdAt ?? null, // Use null instead of service.createdAt
        dueDate: payment?.dueDate ?? null, // Use actual due date from payment record, null if no payment
        amount: payment?.amount ?? service.price,
        paymentId: payment?.id ?? null,
        billingPeriod: payment ? {
          start: payment.billingPeriodStart,
          end: payment.billingPeriodEnd,
        } : null,
      };
    });

    return result;
  }

  /**
   * Generate payment records for all users in an estate when a new service is created
   */
  private async generatePaymentsForNewService(serviceId: string, estateId: string) {
    // Get the service details
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        estate: {
          include: {
            users: {
              where: {
                role: { not: 'ADMIN' }, // Only generate payments for non-admin users
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    const now = new Date();
    const billingCycle = service.billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY';

    // Generate payment records for each user in the estate
    for (const user of service.estate.users) {
      const { billingPeriodStart, billingPeriodEnd, dueDate } = this.calculateBillingPeriod(billingCycle, now);

      // Check if payment already exists for this user and service in current billing period
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          userId: user.id,
          serviceId: service.id,
          billingPeriodStart,
        },
      });

      if (existingPayment) {
        console.log(`Payment already exists for user ${user.id}, service ${service.id}`);
        continue;
      }

      // Generate unique payment reference
      const paymentReference = `${service.estate.name.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      try {
        await this.prisma.payment.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            amount: service.price,
            status: 'PENDING',
            paymentReference,
            billingPeriodStart,
            billingPeriodEnd,
            dueDate,
          },
        });

        console.log(`Generated payment for user ${user.fullName}, service ${service.name}`);
      } catch (error) {
        console.error(`Failed to generate payment for user ${user.id}, service ${service.id}:`, error);
      }
    }
  }

  /**
   * Calculate billing period dates based on billing cycle
   */
  private calculateBillingPeriod(billingCycle: 'MONTHLY' | 'YEARLY', currentDate: Date) {
    const billingPeriodStart = new Date(currentDate);
    const billingPeriodEnd = new Date(currentDate);
    const dueDate = new Date(currentDate);

    if (billingCycle === 'MONTHLY') {
      // Start of current month
      billingPeriodStart.setDate(1);
      billingPeriodStart.setHours(0, 0, 0, 0);

      // End of current month
      billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1, 0);
      billingPeriodEnd.setHours(23, 59, 59, 999);

      // Due date logic: 5th of the month, but handle edge cases
      const currentDay = currentDate.getDate();
      if (currentDay > 5) {
        // If service is created after the 5th, set due date to 5th of next month
        dueDate.setMonth(dueDate.getMonth() + 1, 5);
      } else {
        // If service is created on or before the 5th, set due date to 5th of current month
        dueDate.setDate(5);
      }
      dueDate.setHours(23, 59, 59, 999);
    } else if (billingCycle === 'YEARLY') {
      // Start of current year
      billingPeriodStart.setMonth(0, 1);
      billingPeriodStart.setHours(0, 0, 0, 0);

      // End of current year
      billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1, 0, 0);
      billingPeriodEnd.setHours(23, 59, 59, 999);

      // Due date logic: 31st of January, but handle edge cases
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      
      if (currentMonth === 0 && currentDay > 31) {
        // If in January and after 31st (shouldn't happen, but safety check)
        dueDate.setFullYear(dueDate.getFullYear() + 1, 0, 31);
      } else if (currentMonth > 0) {
        // If after January, set due date to 31st of January next year
        dueDate.setFullYear(dueDate.getFullYear() + 1, 0, 31);
      } else {
        // If in January and before/on 31st, set due date to 31st of current January
        dueDate.setMonth(0, 31);
      }
      dueDate.setHours(23, 59, 59, 999);
    }

    return {
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
    };
  }

}

