import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/auth'; // Assuming you have a decryptToken function

//route for verifying a user by admin
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
    ) {
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
    
        const userId = params.id; // Get user ID from the URL

        // user already verified
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { isVerified: true },
        });

        if (existingUser?.isVerified) {
            return NextResponse.json(
                { error: 'User is already verified' },
                { status: 400 }
            );
        }

        // Verify the user
        const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
        },
        });

        // Optionally, you can log the verification action
        await prisma.log.create({
            data: {
                action: 'VERIFY_USER',
                userId: user.userId,
                details: JSON.stringify({
                    verifiedUserId: updatedUser.id,
                }),
            },
        });
    
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error verifying user:', error);
        return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
        );
    }
    }