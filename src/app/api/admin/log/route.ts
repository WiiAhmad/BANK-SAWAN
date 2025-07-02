import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth';

// Admin route: show all logs, only for admin
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
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        // Fetch all logs
        const logs = await prisma.log.findMany({
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { id: true, name: true, email: true, role: true } } }
        });

        if (!logs || logs.length === 0) {
            return NextResponse.json(
                { error: 'No logs found' },
                { status: 404 }
            );
        }

        // Use inline type for log
        const safeLogs = logs.map((log: { [key: string]: any; user?: { id: string; name: string; email: string; role: string } | null }) => ({
            ...log,
            user: log.user ? {
                id: log.user.id,
                name: log.user.name,
                email: log.user.email,
                role: log.user.role
            } : null
        }));

        return NextResponse.json(safeLogs, { status: 200 });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
