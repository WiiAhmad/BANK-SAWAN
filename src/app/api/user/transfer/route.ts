//this route handle user for transfer money to another user
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth'; // Assuming you have a decryptToken function

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }

    // Verify and decode token
    const user = decryptToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { amount, email, walletNumber } = body;
    // minimum amount validation 9999
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount) || amount > 9999) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!amount || (!email && !walletNumber)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find sender's main wallet
    const senderWallet = await prisma.wallet.findFirst({
      where: { userId: user.userId, walletType: 'MAIN' },
    });
    if (!senderWallet) {
      return NextResponse.json({ error: 'Sender main wallet not found' }, { status: 404 });
    }
    if (Number(senderWallet.balance) < Number(amount)) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Find receiver wallet
    let receiverWallet: typeof senderWallet | null = null;
    if (email) {
      // Find user by email, then their main wallet
      const receiverUser = await prisma.user.findUnique({ where: { email } });
      if (!receiverUser) {
        return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
      }
      receiverWallet = await prisma.wallet.findFirst({
        where: { userId: receiverUser.id, walletType: 'MAIN' },
      });
      if (!receiverWallet) {
        return NextResponse.json({ error: 'Receiver main wallet not found' }, { status: 404 });
      }
    } else if (walletNumber) {
      receiverWallet = await prisma.wallet.findUnique({ where: { walletNumber } });
      if (!receiverWallet) {
        return NextResponse.json({ error: 'Receiver wallet not found' }, { status: 404 });
      }
    }

    if (!receiverWallet) {
      return NextResponse.json({ error: 'Receiver wallet not found' }, { status: 404 });
    }

    // Prevent self-transfer
    if (receiverWallet.id === senderWallet.id) {
      return NextResponse.json({ error: 'Cannot transfer to your own wallet' }, { status: 400 });
    }

    // Transfer: update balances and create transaction
    const transfer = await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      });
      // Add to receiver
      await tx.wallet.update({
        where: { id: receiverWallet!.id },
        data: { balance: { increment: amount } },
      });
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          senderId: user.userId,
          receiverId: receiverWallet!.userId,
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet!.id,
          amount,
          currency: senderWallet.currency,
          status: 'COMPLETED',
          description: `Transfer to ${email || walletNumber}`,
          completedAt: new Date(),
        },
      });
      return transaction;
    });

    return NextResponse.json({ success: true, transaction: transfer });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}