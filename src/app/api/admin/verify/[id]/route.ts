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
    
        const body = await request.json();
        const { status } = body; // status should be 'APPROVED' or 'REJECTED'

        const userId = params.id; // Get user ID from the URL

        // user already verified or rejected
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { verificationStatus: true },
        });

        if (existingUser?.verificationStatus === 'APPROVED') {
            return NextResponse.json(
                { error: 'User is already verified' },
                { status: 400 }
            );
        }
        if (existingUser?.verificationStatus === 'REJECTED') {
            return NextResponse.json(
                { error: 'User verification already rejected' },
                { status: 400 }
            );
        }

        // Update the user verification status
        let newStatus: 'APPROVED' | 'REJECTED';
        if (status === 'REJECTED') {
            newStatus = 'REJECTED';
        } else {
            newStatus = 'APPROVED';
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: newStatus === 'APPROVED',
                verificationStatus: newStatus,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
            },
        });

        // Optionally, you can log the verification action
        await prisma.log.create({
            data: {
                action: 'VERIFY_USER',
                entity: user.role,
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