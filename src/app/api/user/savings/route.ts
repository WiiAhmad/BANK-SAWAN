import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

// POST: Create a new savings plan
export async function POST(request: NextRequest) {
  try {
    // Read cookies from the request
    const userToken = request.cookies.get('token')?.value

    if (!userToken) {
      return NextResponse.json(
        { error: 'Session ID and Authorization User cookie are required' },
        { status: 400 }
      )
    }
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }
    const { title, goalAmount, description, targetDate } = await request.json();
    if (!title || !goalAmount || !targetDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const savingsPlan = await prisma.savingsPlan.create({
      data: {
        userId: user.userId,
        title,
        goalAmount,
        description,
        targetDate: new Date(targetDate),
      },
    });
    return NextResponse.json(savingsPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create savings plan', details: String(error) }, { status: 500 });
  }
}

// GET: Get all savings plans for the user
export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }
    const savingsPlans = await prisma.savingsPlan.findMany({
      where: { userId: user.userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(savingsPlans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch savings plans', details: String(error) }, { status: 500 });
  }
}
