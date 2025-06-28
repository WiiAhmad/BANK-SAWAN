import { hashPassword } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration request received')
    
    // Parse request body
    let body;
    try {
      body = await request.json()
      console.log('Request body parsed:', { ...body, password: '[REDACTED]' })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { name, email, password, phone } = body

    // Validation
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Test database connection
    try {
      console.log('Testing database connection...')
      await prisma.$connect()
      console.log('Database connected successfully')
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Check if user already exists
    try {
      console.log('Checking for existing user with email:', email)
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log('User already exists')
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }
      console.log('No existing user found')
    } catch (findError) {
      console.error('Error checking existing user:', findError)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    // Hash password
    let hashedPassword;
    try {
      console.log('Hashing password...')
      hashedPassword = await hashPassword(password)
      console.log('Password hashed successfully')
    } catch (hashError) {
      console.error('Password hashing error:', hashError)
      return NextResponse.json(
        { error: 'Password hashing failed' },
        { status: 500 }
      )
    }

    // Create user
    let user;
    try {
      console.log('Creating user...')
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
        }
      })
      console.log('User created successfully:', user.id)
    } catch (createError) {
      console.error('User creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create default wallet for user
    try {
      console.log('Creating wallet for user...')
      const walletNumber = `WAL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      await prisma.wallet.create({
        data: {
          userId: user.id,
          walletNumber,
          currency: 'IDR',
          walletType: 'MAIN'
        }
      })
      console.log('Wallet created successfully')
    } catch (walletError) {
      console.error('Wallet creation error:', walletError)
    }

    // Log the registration
    try {
      console.log('Creating registration log...')
      await prisma.log.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          entity: 'USER',
          details: JSON.stringify({
            email: user.email,
            name: user.name
          }),
        }
      })
      console.log('Registration log created successfully')
    } catch (logError) {
      console.error('Log creation error:', logError)
      // Don't return error here, user is already created
    }

    console.log('Registration completed successfully')
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Unexpected registration error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}