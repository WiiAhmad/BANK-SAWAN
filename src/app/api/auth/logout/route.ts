import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptToken } from '@/lib/auth' // Assuming you have a decryptToken function

export async function POST(request: NextRequest) {
  try {
    // Read cookies from the request
    const userToken = request.cookies.get('token')?.value

    // console.log('Logout request received with userToken:', userToken)
    if (!userToken) {
      return NextResponse.json(
        { error: 'Session ID and Authorization User cookie are required' },
        { status: 400 }
      )
    }

    const user = decryptToken(userToken)
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    } 

    // Log the logout activity
    await prisma.log.create({
      data: {
        userId: user.userId,
        action: 'LOGOUT',
        entity: user.role,
      }
    })

    // Remove cookies in the response
    const response = NextResponse.json({ message: 'Logout successful' })
    response.cookies.delete('token')
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}