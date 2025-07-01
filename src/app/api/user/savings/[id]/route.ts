import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

interface MyParams extends NextResponse {
    params: Promise<{ id: string }>;
}

// PATCH: Update a specific savings plan
export async function PATCH(request: NextRequest, { params }: MyParams ) {
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
    const id = (await params).id;
    const body = await request.json();
    const { title, goalAmount, description, targetDate, status: planStatus, category, priority } = body;
    // Check ownership
    const existingPlan = await prisma.savingsPlan.findFirst({
      where: { id, userId: user.userId, isDeleted: false },
    });
    if (!existingPlan) {
      return NextResponse.json({ error: 'Savings plan not found or access denied' }, { status: 404 });
    }
    const updatedPlan = await prisma.savingsPlan.update({
      where: { id },
      data: {
        title,
        goalAmount,
        description,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        status: planStatus,
        category, // add category
        priority, // add priority
      },
    });
    return NextResponse.json(updatedPlan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update savings plan', details: String(error) }, { status: 500 });
  }
}

// DELETE: Soft delete a specific savings plan
export async function DELETE(request: NextRequest, { params }: MyParams) {
  try {
    const { user, error, status } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }
    const id = (await params).id;
    // Check ownership
    const existingPlan = await prisma.savingsPlan.findFirst({
      where: { id, userId: user.userId, isDeleted: false },
    });
    if (!existingPlan) {
      return NextResponse.json({ error: 'Savings plan not found or access denied' }, { status: 404 });
    }
    // Soft delete
    await prisma.savingsPlan.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return NextResponse.json({ message: 'Savings plan deleted (soft) successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete savings plan', details: String(error) }, { status: 500 });
  }
}
