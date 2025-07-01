//this route handles the topup request for a user's wallet
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth'; // Assuming you have a decryptToken function

interface MyParams extends NextResponse {
    params: Promise<{ id: string }>;
}

export async function POST(
    request: NextRequest,
    { params }: MyParams
) {
    try {
        const { amount, paymentMethod } = await request.json();
        const userToken = request.cookies.get('token')?.value;

        if (!userToken) {
            return NextResponse.json(
                { error: 'Authorization token is required' },
                { status: 401 }
            );
        }

        const user = decryptToken(userToken);
        if (!user || !user.userId) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        if (user.role !== 'USER') {
            return NextResponse.json(
                { error: 'Unauthorized action' },
                { status: 403 }
            );
        }

        const walletId = (await params).id; // Get wallet ID from the URL

        // Check if the wallet belongs to the user
        const wallet = await prisma.wallet.findUnique({
            where: {
                id: walletId,
                userId: user.userId,
            },
        });

        if (!wallet) {
            return NextResponse.json(
                { error: 'Wallet not found or access denied' },
                { status: 404 }
            );
        }

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount for topup' },
                { status: 400 }
            );
        }

        // Create a topup request
        const topupRequest = await prisma.topupRequest.create({
            data: {
                userId: user.userId,
                amount,
                paymentMethod,
                walletId,
                status: 'PENDING', // Initial status
            },
            select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                createdAt: true,
                paymentMethod: true,
            },
        });

        // Optionally, you can log the topup request creation
        await prisma.log.create({
            data: {
                userId: user.userId,
                action: 'TOPUP_REQUEST',
                entity: 'WALLET',
            }
        });

        return NextResponse.json(topupRequest);
    } catch (error) {
        console.error('Topup request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}