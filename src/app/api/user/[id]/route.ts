//this route is used to get a user by id
import { NextResponse, NextRequest } from 'next/server';
import {prisma} from '@/lib/prisma';
import { decryptToken, verifyToken, verifyPassword, hashPassword } from '@/lib/auth'; // Assuming you have a decryptToken function

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    
  try {
    const { id: userId } = await params;
    const userToken = request.cookies.get('token')?.value;

    if (!userToken) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const user = decryptToken(userToken);
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if(user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Unauthorized action' },
        { status: 403 }
      )
    }

    if( userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Fetch the user by ID
    const fetchedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!fetchedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optionally, you can exclude sensitive fields like password
    const { role, password, ...userData } = fetchedUser;

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;
    const userToken = request.cookies.get('token')?.value;

    if (!userToken) {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    // Verify and decrypt the token
    if (!verifyToken(userToken)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = decryptToken(userToken);
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if(user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Unauthorized action' },
        { status: 403 }
      )
    }

    if( userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const updatedData = await request.json();
    // must have password to confirm the user
    if (!updatedData.password) {
      return NextResponse.json({ error: 'Password is required to update user' }, { status: 400 });
    }
    // if password wrong, return error
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });
    // console.log('User to update:', userToUpdate);

    const isPasswordValid = await verifyPassword(updatedData.password, userToUpdate?.password || '');
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    console.log('Password is valid');
    // If a new password is provided, hash it
    if (updatedData.updatedPassword) {
      const hashedPassword = await hashPassword(updatedData.updatedPassword);
      updatedData.password = hashedPassword; // Update the password field with the hashed password
    } else {
      delete updatedData.password; // Remove password from update data if not changing
    }
    // Remove updatedPassword from updatedData to avoid Prisma error
    delete updatedData.updatedPassword;

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updatedData,
        // Ensure password is not updated if not provided
        ...(updatedData.password ? { password: updatedData.password } : {}),
      },
    });

    //create log for updated user
    try {
      await prisma.log.create({
        data: {
          userId: userId,
          entity: 'USER',
          action: 'UPDATE',
          details: `User ${userId} updated their data`,
        },
      });
      console.log('Log created for user update');
    } catch (error) {
      console.error('Error creating log for user update:', error);
    }
    
    // console.log('Updated user:', updatedUser);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}   