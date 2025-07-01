import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth';

interface MyParams extends NextResponse {
    params: Promise<{ id: string }>;
}

export async function POST(
    request: NextRequest,
    { params }: MyParams
) {
    try {
        // Await params for Next.js App Router
        const walletSenderId = (await params).id;
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token. Please provide a valid authentication token in your cookies.' }, { status: 401 });
        }

        const user = decryptToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, walletNumber, desc } = body;

        if (!walletSenderId || typeof amount !== 'number' || amount < 9999 || isNaN(amount)) {
            return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 });
        }
        if (!amount || !walletNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get the wallet belonging to the user from the token
        const senderWallet = await prisma.wallet.findFirst({
            where: {
                walletNumber: walletSenderId,
                userId: user.userId,
            },
        });

        if (!senderWallet) {
            return NextResponse.json({ error: 'Sender wallet not found or unauthorized' }, { status: 404 });
        }
        if (Number(senderWallet.balance) < Number(amount)) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Find receiver wallet by walletNumber
        const receiverWallet = await prisma.wallet.findUnique({ where: { walletNumber } });
        if (!receiverWallet) {
            return NextResponse.json({ error: 'Receiver wallet not found' }, { status: 404 });
        }

        // Prevent self-transfer
        if (receiverWallet.id === senderWallet.id) {
            return NextResponse.json({ error: 'Cannot transfer to your own wallet' }, { status: 400 });
        }

        // Transfer: update balances and create transaction
        const transfer = await prisma.$transaction(async (tx) => {
            await tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balance: { decrement: amount } },
            });
            await tx.wallet.update({
                where: { id: receiverWallet.id },
                data: { balance: { increment: amount } },
            });
            const transaction = await tx.transaction.create({
                data: {
                    senderId: user.userId,
                    receiverId: receiverWallet.userId,
                    senderWalletId: senderWallet.id,
                    receiverWalletId: receiverWallet.id,
                    amount,
                    currency: senderWallet.currency,
                    status: 'COMPLETED',
                    description: desc || `Transfer to ${walletNumber}`,
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
