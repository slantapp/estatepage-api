import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Request } from 'express';
import { WebhookDto } from './dto/webHook-payload.dto';
import { JwtAuthGuard } from '../auth/guard/JWT-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }

  /**
   * User initiates a payment for a service.
   */
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiatePayment(@Body() body:CreatePaymentDto, @Req() req: Request) {
    body.userId = req.user['id']; 
    return this.paymentService.initiatePayment(body);
  }

  /**
   * Webhook endpoint for payment gateway to notify about transaction status.
   */
  @Post('webhook')
  async handleWebhook(@Body() body:WebhookDto) {
    return this.paymentService.handlePaymentWebhook(body);
  }

  /**
   * Get all completed payments for a user and the sum of completed payments.
   */
  @Get('user/:userId/completed-payments')
  async getUserCompletedPaymentsSummary(@Param('userId') userId: string) {
    return this.paymentService.getUserCompletedPaymentsSummary(userId);
  }
}
