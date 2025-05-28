import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import axios from 'axios';
import { WebhookDto } from './dto/webHook-payload.dto';

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
   * User initiates a payment for a service and gets Flutterwave payment link.
   */
  async initiatePayment(data: CreatePaymentDto) {
    try {
      // 1. Generate a unique payment reference
      const paymentReference = `ESTATE-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      // 2. Create a pending payment in your DB with the reference
      const payment = await this.prisma.payment.create({
        data: {
          userId: data.userId,
          serviceId: data.serviceId,
          amount: data.amount,
          status: 'pending',
          paymentReference,
        },
      });

      // 3. Call Flutterwave initialize endpoint
      const flutterwaveRes = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: paymentReference,
          amount: data.amount,
          currency: data.currency || 'NGN',
          redirect_url: process.env.FLW_REDIRECT_URL,
          customer: {
            email: data.email,
            name: data.fullName || '',
          },
          customizations: {
            title: data.serviceName || 'Payment for Service',
            description: `Payment for ${data.serviceName || 'Service'}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      // 4. Return payment link and reference to frontend
      return {
        paymentId: payment.id,
        paymentReference,
        paymentLink: flutterwaveRes.data.data.link,
      };
    } catch (error) {
      // Handle errors from DB or Flutterwave
      if (error.response && error.response.data) {
        // Flutterwave error
        throw new Error(`Flutterwave error: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Failed to initiate payment: ${error.message}`);
    }
  }

  /**
   * Handle payment gateway webhook (create transaction and update payment).
   */
  async handlePaymentWebhook(webhookData: WebhookDto) {
    // 1. Find the payment by reference
    const payment = await this.prisma.payment.findUnique({
      where: { paymentReference: webhookData.tx_ref },
    });
    if (!payment) throw new Error('Payment not found for reference');

    // 2. Create the transaction
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionId: webhookData.transactionId,
        transactionReference: webhookData.transactionReference,
        status: webhookData.status,
        amount: webhookData.amount,
        currency: webhookData.currency,
      },
    });

    // 3. Update the payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
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
