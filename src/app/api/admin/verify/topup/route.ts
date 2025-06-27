//this route for get all topup requests from user
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth'; // Assuming you have a decryptToken function

// Route for getting all topup requests from users
export async function GET(request: NextRequest) {
    try {
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
    
        // Fetch all topup requests
        const topupRequests = await prisma.topupRequest.findMany({
        select: {
            id: true,
            userId: true,
            amount: true,
            status: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc', // Order by creation date, most recent first
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