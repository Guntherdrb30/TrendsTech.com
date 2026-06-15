'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';

const USD_MICROS = 1_000_000;

export async function approvePayment(paymentId: string, notes?: string) {
  const user = await requireRole('ROOT');

  const payment = await prisma.manualPayment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'PENDING' && payment.status !== 'REVIEWING') {
    throw new Error('Payment is not in a reviewable state');
  }

  // Amount in USD to credit (use amountUsd if available, else amountPaid for USD payments)
  const usdAmount =
    payment.amountUsd != null
      ? Number(payment.amountUsd)
      : payment.currencyPaid === 'USD'
        ? Number(payment.amountPaid)
        : payment.exchangeRateUsed
          ? Number(payment.amountPaid) / Number(payment.exchangeRateUsed)
          : 0;

  const creditsToAdd = Math.round(usdAmount * USD_MICROS);

  await prisma.$transaction(async (tx) => {
    await tx.manualPayment.update({
      where: { id: paymentId },
      data: {
        status: 'APPROVED',
        reviewedByUserId: user.id,
        reviewedAt: new Date(),
        reviewNotes: notes?.trim() || null
      }
    });

    if (creditsToAdd > 0) {
      await tx.tokenWallet.upsert({
        where: { tenantId: payment.tenantId },
        create: { tenantId: payment.tenantId, balance: creditsToAdd },
        update: { balance: { increment: creditsToAdd } }
      });
    }
  });

  revalidatePath('/[locale]/admin/payments', 'page');
}

export async function rejectPayment(paymentId: string, notes?: string) {
  const user = await requireRole('ROOT');

  await prisma.manualPayment.update({
    where: { id: paymentId },
    data: {
      status: 'REJECTED',
      reviewedByUserId: user.id,
      reviewedAt: new Date(),
      reviewNotes: notes?.trim() || null
    }
  });

  revalidatePath('/[locale]/admin/payments', 'page');
}

export async function setReviewing(paymentId: string) {
  await requireRole('ROOT');
  await prisma.manualPayment.update({
    where: { id: paymentId },
    data: { status: 'REVIEWING' }
  });
  revalidatePath('/[locale]/admin/payments', 'page');
}
