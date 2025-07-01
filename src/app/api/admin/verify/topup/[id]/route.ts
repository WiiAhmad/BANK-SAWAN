//this route for admin verify a topup request
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
        const body = await request.json();
        const { status } = body;
        const topupId = (await params).id; // Get topup request ID from the URL
        // console.log('params:', params);
        // if (!params.id || typeof params.id !== 'string') {
        //     return NextResponse.json(
        //         { error: 'Invalid topup request ID' },
        //         { status: 400 }
        //     );
        // }
        
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

        // Check if the user is an admin
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Check if the topup request exists
        const existingTopup = await prisma.topupRequest.findUnique({
            where: { id: topupId },
            select: { status: true },
        });
        if (!existingTopup) {
            return NextResponse.json(
                { error: 'Topup request not found' },
                { status: 404 }
            );
        }
        if (existingTopup.status === 'APPROVED') {
            return NextResponse.json(
                { error: 'Topup request already verified' },
                { status: 400 }
            );
        }

        // Verify the topup request based on status from body
        let newStatus: 'APPROVED' | 'REJECTED';
        if (status === 'REJECTED') {
            newStatus = 'REJECTED';
        } else {
            newStatus = 'APPROVED';
        }
        const updatedTopup = await prisma.topupRequest.update({
            where: { id: topupId },
            data: { status: newStatus }, // Change status to APPROVED or REJECTED
            select: {
                id: true,
                userId: true,
                amount: true,
                status: true,
                createdAt: true,
                paymentMethod: true,
            },
        });

        // Fetch the wallet associated with the user
        const wallet = await prisma.wallet.findFirst({
            where: { userId: updatedTopup.userId },
            select: { id: true },
        });

        // Optionally, you can log the topup request creation
        await prisma.log.create({
            data: {
                action: `TOPUP_${newStatus}`,
                entity: 'WALLET',
                details: JSON.stringify({
                    userId: user.userId,
                    walletId: wallet?.id ?? null,
                    amount: updatedTopup.amount,
                    paymentMethod: updatedTopup.paymentMethod,
                }),
                level: 'INFO',
            },
        });

        // Update the wallet balance only if approved
        if (wallet && newStatus === 'APPROVED') {
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        increment: updatedTopup.amount, // Increment the wallet balance
                    },
                },
            });
            // Create a transaction record for the approved topup
            await prisma.transaction.create({
                data: {
                    senderId: user.userId, // Use the current admin as sender
                    receiverId: updatedTopup.userId,
                    receiverWalletId: wallet.id,
                    amount: updatedTopup.amount,
                    status: 'COMPLETED',
                    description: `Topup approved via ${updatedTopup.paymentMethod}`,
                },
            });
        }

        return NextResponse.json(updatedTopup);
    } catch (error) {
        console.error('Error verifying topup request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}