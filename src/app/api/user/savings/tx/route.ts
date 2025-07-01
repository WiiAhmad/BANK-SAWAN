// this route for user to topup their savings account
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decryptToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }
    const user = decryptToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Parse body
    const { amount, savingsPlanId, type } = await request.json();
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!savingsPlanId || typeof savingsPlanId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid savingsPlanId' }, { status: 400 });
    }
    let normalizedType = typeof type === 'string' ? type.toUpperCase() : '';
    if (!normalizedType || (normalizedType !== 'TOPUP' && normalizedType !== 'REDEEM')) {
      return NextResponse.json({ error: 'Invalid type, must be "TOPUP" or "REDEEM"' }, { status: 400 });
    }

    // Find savings plan and wallet
    const savingsPlan = await prisma.savingsPlan.findFirst({
      where: {
        id: savingsPlanId,
        userId: user.userId,
        isDeleted: false,
      },
      include: { wallet: true },
    });
    if (!savingsPlan) {
      return NextResponse.json({ error: 'Savings plan not found' }, { status: 404 });
    }
    if (!savingsPlan.walletId || !savingsPlan.wallet) {
      return NextResponse.json({ error: 'Savings wallet not found for this plan' }, { status: 404 });
    }
    const savingsWallet = savingsPlan.wallet;

    // Find main wallet (source/destination)
    const mainWallet = await prisma.wallet.findFirst({
      where: {
        userId: user.userId,
        walletType: 'MAIN',
        isDeleted: false,
      },
    });
    if (!mainWallet) {
      return NextResponse.json({ error: 'Main wallet not found' }, { status: 404 });
    }

    if (normalizedType === 'TOPUP') {
      if (Number(mainWallet.balance) < amount) {
        return NextResponse.json({ error: 'Insufficient balance in main wallet' }, { status: 400 });
      }
      // Topup: main -> savings
      const transaction = await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: mainWallet.id },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: savingsWallet.id },
          data: { balance: { increment: amount } },
        });
        await tx.savingsPlan.update({
          where: { id: savingsPlanId },
          data: { currentAmount: { increment: amount } },
        });
        return tx.transaction.create({
          data: {
            senderId: user.userId,
            receiverId: user.userId,
            senderWalletId: mainWallet.id,
            receiverWalletId: savingsWallet.id,
            amount,
            currency: mainWallet.currency,
            status: 'COMPLETED',
            description: `Top up to savings plan: ${savingsPlan.title}`,
            completedAt: new Date(),
          },
        });
      });
      return NextResponse.json({ success: true, transaction });
    } else if (normalizedType === 'REDEEM') {
      if (Number(savingsWallet.balance) < amount) {
        return NextResponse.json({ error: 'Insufficient balance in savings wallet' }, { status: 400 });
      }
      if (Number(savingsPlan.currentAmount) < amount) {
        return NextResponse.json({ error: 'Insufficient current amount in savings plan' }, { status: 400 });
      }
      // Redeem: savings -> main
      const transaction = await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: savingsWallet.id },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: mainWallet.id },
          data: { balance: { increment: amount } },
        });
        await tx.savingsPlan.update({
          where: { id: savingsPlanId },
          data: { currentAmount: { decrement: amount } },
        });
        return tx.transaction.create({
          data: {
            senderId: user.userId,
            receiverId: user.userId,
            senderWalletId: savingsWallet.id,
            receiverWalletId: mainWallet.id,
            amount,
            currency: mainWallet.currency,
            status: 'COMPLETED',
            description: `Redeem from savings plan: ${savingsPlan.title}`,
            completedAt: new Date(),
          },
        });
      });
      return NextResponse.json({ success: true, transaction });
    }
    // Fallback for any unhandled type
    return NextResponse.json({ error: 'Unhandled transaction type' }, { status: 400 });
  } catch (error) {
    console.error('Top up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

