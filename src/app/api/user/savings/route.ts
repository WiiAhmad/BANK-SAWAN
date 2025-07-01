import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, decryptToken } from '@/lib/auth';

// POST: Create a new savings plan
export async function POST(request: NextRequest) {
  try {
    // Read cookies from the request
    const userToken = request.cookies.get('token')?.value
    const datenow = new Date();

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
    // Validate goalAmount
    if (typeof goalAmount !== 'number' || goalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid goal amount' }, { status: 400 });
    }
    // Validate targetDate
    if (isNaN(new Date(targetDate).getTime())) {
      return NextResponse.json({ error: 'Invalid target date' }, { status: 400 });
    }
    // Check if targetDate is in the future
    const targetDateObj = new Date(targetDate);
    if (targetDateObj <= datenow) {
      return NextResponse.json({ error: 'Target date must be in the future' }, { status: 400 });
    }
    // create savings wallet if not exists
    // Find existing wallet or create a new one, then use its id for walletId (never null)
    let wallet = await prisma.wallet.findFirst({
      where: {
      userId: user.userId,
      walletType: 'SAVINGS',
      isDeleted: false,
      },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
      data: {
        userId: user.userId,
        walletNumber: `SAV${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
        name: 'Savings Wallet',
        description: 'Wallet for savings plans',
        currency: 'IDR',
        walletType: 'SAVINGS',
      },
      });
    }
    // Remove the check for existingPlan so multiple savings plans can be created for the same wallet
    const savingsPlan = await prisma.savingsPlan.create({
      data: {
      userId: user.userId,
      walletId: wallet.id, // Always not null
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
