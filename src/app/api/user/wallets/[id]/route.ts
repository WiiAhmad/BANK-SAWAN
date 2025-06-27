// src/app/api/user/wallets/[id]/route.ts
// Handles GET, PATCH, and DELETE operations for a specific wallet.

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth'; // Assuming you have a decryptToken function

// Helper function for authentication and user retrieval
async function authenticateRequest(request: NextRequest) {
  const userToken = request.cookies.get('token')?.value;

  if (!userToken) {
    return { error: 'Authorization token is required', status: 401, user: null };
  }

  try {
    const user = decryptToken(userToken);
    if (!user || !user.userId) {
      return { error: 'Invalid or expired token', status: 401, user: null };
    }
    return { user, error: null, status: 200 };
  } catch (error) {
    return { error: 'Invalid token format', status: 401, user: null };
  }
}

/**
 * GET a specific wallet by its ID.
 * Ensures the wallet belongs to the authenticated user.
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

    const { id: walletId } = await params; // Await params for Next.js dynamic route

    const wallet = await prisma.wallet.findUnique({
      where: {
        id: walletId,
        // Security check: Ensure the wallet belongs to the logged-in user
        userId: user!.userId,
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

    const { id: walletId } = await params; // Await params for Next.js dynamic route

    // To ensure a user can only delete their own wallet, we use a compound where clause.
    // The delete will only succeed if a wallet with this ID AND this userId exists.
    const deleteResult = await prisma.wallet.deleteMany({
      where: {
        id: walletId,
        userId: user!.userId,
      },
    });

    // deleteMany returns a count of deleted records.
    // If the count is 0, it means no record was found matching both criteria.
    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: 'Wallet not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Wallet deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
