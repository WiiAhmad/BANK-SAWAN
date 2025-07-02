import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth';

// Admin route: show all transactions, only for admin
export async function GET(request: NextRequest) {
    try {
        const userToken = request.cookies.get('token')?.value;
        if (!userToken) {
            return NextResponse.json(
                { error: 'Unauthorized: No token. Please provide a valid authentication token in your cookies.' },
                { status: 401 }
            );
        }
        const user = decryptToken(userToken);
        if (!user || user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        // Fetch all transactions
        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            include: { sender: true, receiver: true }
        });

        if (!transactions || transactions.length === 0) {
            return NextResponse.json(
                { error: 'No transactions found' },
                { status: 404 }
            );
        }

        // Sanitize transactions to hide sensitive user info
        const safeTransactions = transactions.map((tx: { [key: string]: any; sender?: { id: string; name: string; email: string } | null; receiver?: { id: string; name: string; email: string } | null }) => ({
            ...tx,
            sender: tx.sender ? {
                id: tx.sender.id,
                name: tx.sender.name,
                email: tx.sender.email,
            } : null,
            receiver: tx.receiver ? {
                id: tx.receiver.id,
                name: tx.receiver.name,
                email: tx.receiver.email,
            } : null
        }));

        return NextResponse.json(safeTransactions, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
