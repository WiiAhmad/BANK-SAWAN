//this route for see all topup request in user wallet

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth'; // Assuming you have a decryptToken function

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const walletId = params.id; // Get wallet ID from the URL

    // Check if the wallet belongs to the user
    const wallet = await prisma.wallet.findUnique({
      where: {
        id: walletId,
        userId: user!.userId,
        isDeleted: false, // Exclude soft-deleted wallets
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch all topup requests for the user's wallet
    const topupRequests = await prisma.topupRequest.findMany({
      where: {
        walletId: wallet.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(topupRequests);
  } catch (error) {
    console.error('Error fetching topup requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}