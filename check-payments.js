const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSecurityServicePayments() {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        service: {
          name: 'security  Service'
        }
      },
      include: {
        service: {
          select: {
            name: true,
            billingCycle: true,
            createdAt: true
          }
        },
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      take: 5
    });

    console.log('Payment records for Security Service:');
    console.log('=====================================');
    
    if (payments.length === 0) {
      console.log('No payment records found for security service');
    } else {
      payments.forEach((payment, index) => {
        console.log(`Payment ${index + 1}:`);
        console.log(`  User: ${payment.user.fullName} (${payment.user.email})`);
        console.log(`  Service: ${payment.service.name}`);
        console.log(`  Service Created: ${payment.service.createdAt}`);
        console.log(`  Billing Period: ${payment.billingPeriodStart} to ${payment.billingPeriodEnd}`);
        console.log(`  Due Date: ${payment.dueDate}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Amount: ${payment.amount}`);
        console.log('  ---');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSecurityServicePayments();
