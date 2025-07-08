import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates payment records for the next billing cycle for all active services
   * This should run at the beginning of each month
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyPayments() {
    console.log('Generating monthly payment records...');
    await this.generatePaymentsForBillingCycle('MONTHLY');
  }

  /**
   * Generates payment records for yearly services
   * This should run daily to catch any yearly services that need renewal
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateYearlyPayments() {
    console.log('Checking for yearly payment records...');
    await this.generatePaymentsForBillingCycle('YEARLY');
  }

  /**
   * Generates payment records for a specific billing cycle
   */
  private async generatePaymentsForBillingCycle(billingCycle: 'MONTHLY' | 'YEARLY') {
    const now = new Date();
    
    // Get all active services with the specified billing cycle
    const services = await this.prisma.service.findMany({
      where: {
        isActive: true,
        billingCycle: billingCycle.toLowerCase(),
        OR: [
          { endDate: null }, // No end date
          { endDate: { gte: now } }, // End date in the future
        ],
      },
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

    for (const service of services) {
      for (const user of service.estate.users) {
        await this.generatePaymentForUser(service, user.id, billingCycle, now);
      }
    }
  }

  /**
   * Generates a payment record for a specific user and service
   */
  private async generatePaymentForUser(
    service: any,
    userId: string,
    billingCycle: 'MONTHLY' | 'YEARLY',
    currentDate: Date,
  ) {
    const { billingPeriodStart, billingPeriodEnd, dueDate } = this.calculateBillingPeriod(
      billingCycle,
      currentDate,
    );

    // Check if payment already exists for this billing period
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        serviceId: service.id,
        billingPeriodStart,
      },
    });

    if (existingPayment) {
      console.log(`Payment already exists for user ${userId}, service ${service.id}, period ${billingPeriodStart}`);
      return;
    }

    // Generate unique payment reference
    const paymentReference = `${service.estate.name.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Create the payment record
    try {
      const payment = await this.prisma.payment.create({
        data: {
          userId,
          serviceId: service.id,
          amount: service.price,
          status: 'PENDING',
          paymentReference,
          billingPeriodStart,
          billingPeriodEnd,
          dueDate,
        },
      });

      console.log(`Generated payment ${payment.id} for user ${userId}, service ${service.name}`);
    } catch (error) {
      console.error(`Failed to generate payment for user ${userId}, service ${service.id}:`, error);
    }
  }

  /**
   * Calculates billing period dates based on billing cycle
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

      // Due date: 5th of the month (you can customize this)
      dueDate.setDate(5);
      dueDate.setHours(23, 59, 59, 999);
    } else if (billingCycle === 'YEARLY') {
      // Start of current year
      billingPeriodStart.setMonth(0, 1);
      billingPeriodStart.setHours(0, 0, 0, 0);

      // End of current year
      billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1, 0, 0);
      billingPeriodEnd.setHours(23, 59, 59, 999);

      // Due date: 31st of January (you can customize this)
      dueDate.setMonth(0, 31);
      dueDate.setHours(23, 59, 59, 999);
    }

    return {
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
    };
  }

  /**
   * Manually generate payments for a specific estate (useful for testing or manual triggers)
   */
  async generatePaymentsForEstate(estateId: string, billingCycle?: 'MONTHLY' | 'YEARLY') {
    const now = new Date();
    
    const services = await this.prisma.service.findMany({
      where: {
        estateId,
        isActive: true,
        ...(billingCycle && { billingCycle: billingCycle.toLowerCase() }),
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      include: {
        estate: {
          include: {
            users: {
              where: {
                role: { not: 'ADMIN' },
              },
            },
          },
        },
      },
    });

    for (const service of services) {
      for (const user of service.estate.users) {
        await this.generatePaymentForUser(
          service,
          user.id,
          service.billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY',
          now,
        );
      }
    }
  }

  /**
   * Get pending payments for a user in the current billing period
   */
  async getPendingPaymentsForUser(userId: string, estateId?: string) {
    const now = new Date();
    
    return this.prisma.payment.findMany({
      where: {
        userId,
        status: 'PENDING',
        billingPeriodStart: { lte: now },
        billingPeriodEnd: { gte: now },
        ...(estateId && {
          service: {
            estateId,
          },
        }),
      },
      include: {
        service: {
          include: {
            estate: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}
