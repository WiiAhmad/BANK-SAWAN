import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user?.isVerified === false) {
      return NextResponse.json(
        { error: 'User account is not verified' },
        { status: 403 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role)

    // Log the login activity
    await prisma.log.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: user.role
      }
    })

    // Return success response with token in cookie and custom header
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
    // Set token in HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    })
    // Set custom header
    response.headers.set('Authorization-User', token)
    return response

  } catch (error) {
    console.error('Login error:', error)
    
    // Log the error
    await prisma.log.create({
      data: {
        action: 'LOGIN_ERROR',
        entity: 'SYSTEM',
        level: 'ERROR',
      }
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}