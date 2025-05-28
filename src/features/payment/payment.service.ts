import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  /**
   * Create a payment transaction (e.g., from webhook)
   */
  async createTransaction(data: {
    paymentId: string;
    transactionId: string;
    transactionReference: string;
    status: string;
    amount: number;
    currency: string;
  }) {
    return this.prisma.paymentTransaction.create({
      data,
    });
  }

  /**
   * Get all transactions for a payment
   */
  async getTransactionsForPayment(paymentId: string) {
    return this.prisma.paymentTransaction.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all completed transactions grouped by month with total amount for each month
   */
  async getCompletedTransactionsGroupedByMonth() {
    // Raw SQL for grouping by month (works with PostgreSQL, adjust for other DBs)
    return this.prisma.$queryRaw<
      Array<{ month: string; totalAmount: number }>
    >`
      SELECT 
        TO_CHAR("createdAt", 'Month') AS month,
        SUM(amount) AS "totalAmount"
      FROM "PaymentTransaction"
      WHERE status = 'success'
      GROUP BY month, date_trunc('month', "createdAt")
      ORDER BY date_trunc('month', "createdAt") ASC
    `;
  }

  /**
   * User initiates a payment for a service.
   */
  async initiatePayment(data: {
    userId: string;
    serviceId: string;
    amount: number;
  }) {
    // Create a pending payment
    return this.prisma.payment.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        amount: data.amount,
        status: 'pending',
      },
    });
  }

  /**
   * Handle payment gateway webhook (create transaction and update payment).
   */
  async handlePaymentWebhook(webhookData: {
    paymentId: string;
    transactionId: string;
    transactionReference: string;
    status: string; // 'success', 'failed', etc.
    amount: number;
    currency: string;
  }) {
    // Create the transaction
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        paymentId: webhookData.paymentId,
        transactionId: webhookData.transactionId,
        transactionReference: webhookData.transactionReference,
        status: webhookData.status,
        amount: webhookData.amount,
        currency: webhookData.currency,
      },
    });

    // Update the payment status
    await this.prisma.payment.update({
      where: { id: webhookData.paymentId },
      data: { status: webhookData.status },
    });

    return transaction;
  }

  /**
   * Get all completed payments for a user and the sum of completed payments.
   */
  async getUserCompletedPaymentsSummary(userId: string) {
    const completedPayments = await this.prisma.payment.findMany({
      where: {
        userId,
        status: 'completed',
      },
      select: {
        id: true,
        amount: true,
        serviceId: true,
        paymentDate: true,
        createdAt: true,
      },
    });

    const totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      payments: completedPayments,
      totalAmount,
    };
  }
}
