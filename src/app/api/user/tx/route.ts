//this route for get all transactions of a user
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, decryptToken } from '@/lib/auth'; // Assuming you have a decryptToken function

// get all transactions of a user same as cookie user

export async function GET(request: NextRequest) {
    try {
        const userToken = request.cookies.get('token')?.value
        if (!userToken) {
            return NextResponse.json(
                { error: 'Unauthorized: No token. Please provide a valid authentication token in your cookies.' },
                { status: 401 }
            );
        }
        const user = decryptToken(userToken);
        if (!user || user.role !== 'user') {
            return NextResponse.json({ error: 'Forbidden: Users only' }, { status: 403 });
        }

        // Fetch all transactions where the user is either the sender or receiver
        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { senderId: user.userId },
                    { receiverId: user.userId }
                ]
            },
            orderBy: {
                createdAt: 'desc' // Order transactions by creation date, most recent first
            },
            include: { sender: true, receiver: true }
        });
        // console.log('Fetched transactions:', transactions);
        if (!transactions || transactions.length === 0) {
            return NextResponse.json(
                { error: 'No transactions found for this user' },
                { status: 404 }
            );
        }

        // Sanitize transactions to hide sensitive user info
        const safeTransactions = transactions.map(tx => ({
            ...tx,
            sender: tx.sender ? {
                id: tx.sender.id,
                name: tx.sender.name,
                email: tx.sender.email, // Assuming you want to include email
            } : null,
            receiver: tx.receiver ? {
                id: tx.receiver.id,
                name: tx.receiver.name,
                email: tx.receiver.email, // Assuming you want to include email
            } : null
        }));

        return NextResponse.json(safeTransactions, {
            status: 200
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } 
}