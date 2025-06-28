// this route for admin to get all users
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth'; // Assuming you have a decryptToken function

// get all users only for admin or superadmin
export async function GET(request: NextRequest) {
    try {
        const { user, error, status } = await authenticateRequest(request);
        if (error) {
        return NextResponse.json({ error }, { status });
        }
    
        // Check if the user is an admin or superadmin
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
        }
    
        // Fetch all users
        const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
        });
    
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
        );
    }
    }
