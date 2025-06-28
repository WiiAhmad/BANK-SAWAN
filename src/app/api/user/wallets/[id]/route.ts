// src/app/api/user/wallets/[id]/route.ts
// Handles GET, PATCH, and DELETE operations for a specific wallet.

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth'; // Assuming you have a decryptToken function

/**
 * GET a specific wallet by its ID.
 * Ensures the wallet belongs to the authenticated user.
 * Now excludes soft-deleted wallets (isDeleted=true).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { id: walletId } = await params;

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

    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH (update) a specific wallet's details.
 * Ensures the wallet belongs to the authenticated user.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { id: walletId } = await params; // Await params for Next.js dynamic route
    const body = await request.json();

    // Fields that are allowed to be updated
    const { name, description } = body;

    // First, verify the wallet exists and belongs to the user
    const existingWallet = await prisma.wallet.findFirst({
        where: {
            id: walletId,
            userId: user!.userId
        }
    });

    if (!existingWallet) {
        return NextResponse.json({ error: 'Wallet not found or access denied' }, { status: 404 });
    }

    // Update the wallet
    const updatedWallet = await prisma.wallet.update({
      where: {
        id: walletId,
      },
      data: {
        name,
        description,
      },
    });

    //add log UPDATE WALLET
    await prisma.log.create({
      data: {
        userId: user!.userId,
        action: 'UPDATE_WALLET',
        details: `Updated wallet ${walletId} with name: ${name}, description: ${description}`,
      },
    });

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE a specific wallet by its ID.
 * Ensures the wallet belongs to the authenticated user.
 * Now performs a soft delete (sets isDeleted=true, deletedAt=now()).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { id: walletId } = params;

    // Prevent deletion of the main wallet
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId: user!.userId,
        isDeleted: false,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        walletNumber: true,
        description: true,
        balance: true,
        currency: true,
        walletType: true,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found or access denied' },
        { status: 404 }
      );
    }

    if (wallet.walletType === "MAIN") {
      return NextResponse.json(
        { error: 'Cannot delete the main wallet' },
        { status: 400 }
      );
    }

    // If wallet is SAVINGS or SECONDARY and has balance, transfer to MAIN wallet
    if ((wallet.walletType === 'SAVINGS' || wallet.walletType === 'SECONDARY') && Number(wallet.balance) > 0) {
      const mainWallet = await prisma.wallet.findFirst({
        where: {
          userId: user!.userId,
          walletType: 'MAIN',
          isDeleted: false,
        },
      });
      if (!mainWallet) {
        return NextResponse.json({ error: 'Main wallet not found for transfer' }, { status: 500 });
      }
      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: mainWallet.id },
          data: { balance: { increment: wallet.balance } },
        }),
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: 0 },
        }),
        prisma.transaction.create({
          data: {
            senderId: user!.userId,
            receiverId: user!.userId,
            senderWalletId: wallet.id,
            receiverWalletId: mainWallet.id,
            amount: wallet.balance,
            currency: wallet.currency,
            status: 'COMPLETED',
            description: `Transfer balance from deleted ${wallet.walletType} wallet (${wallet.walletNumber}) to MAIN wallet`,
            completedAt: new Date(),
          },
        }),
      ]);
    }

    // Soft delete: set isDeleted=true and deletedAt=now()
    await prisma.wallet.update({
      where: { id: walletId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await prisma.log.create({
      data: {
        userId: user!.userId,
        entity: 'USER',
        action: 'DELETE_WALLET',
        details: `Soft deleted wallet ${walletId} (${wallet.walletType})`,
      },
    });

    return NextResponse.json({ message: 'Wallet deleted (soft) successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
