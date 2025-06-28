import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Read cookies from the request
    const userToken = request.cookies.get('token')?.value

    if (!userToken) {
      return NextResponse.json(
        { error: 'Session ID and Authorization User cookie are required' },
        { status: 400 }
      )
    }

    // Decrypt the user token to get user information
    const user = decryptToken(userToken)
    // console.log('Decrypted user token:', user)

    // Fetch user wallets associated with the userId
    const wallets = await prisma.wallet.findMany({
      where: {
      userId: user?.userId, // Ensure userId is correctly accessed from the decrypted token
      isDeleted: false // Only fetch wallets that are not deleted
      },
      orderBy: {
      createdAt: 'asc' // Order wallets by creation date, oldest first
      }
    })
    // console.log('Fetched wallets:', wallets)

    return NextResponse.json(wallets)
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Read cookies from the request
    const userToken = request.cookies.get('token')?.value
    const { name, description } = await request.json()

    if (!userToken) {
      return NextResponse.json(
        { error: 'Session ID and Authorization User cookie are required' },
        { status: 400 }
      )
    }

    // Decrypt the user token to get user information
    const user = decryptToken(userToken)
    console.log('Decrypted user token:', user)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid user token' },
        { status: 401 }
      )
    }

    if(user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Unauthorized action' },
        { status: 403 }
      )
    }

    // Handle wallet creation logic here
    // Create default wallet for user
    try {
      console.log('Creating wallet for user...')
      const walletNumber = `WAL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      await prisma.wallet.create({
        data: {
          userId: user.userId,
          walletNumber,
          currency: 'IDR',
          walletType: 'SECONDARY', // Assuming this is a secondary wallet
          name: name,
          description: description || '', // Optional description
        }
      })
      console.log('Wallet created successfully')
    } catch (walletError) {
      console.error('Wallet creation error:', walletError)
      // Don't return error here, user is already created
      // You might want to handle this differently
    }

    try {
      console.log('Creating Wallet created log...')
      await prisma.log.create({
        data: {
          userId: user.userId,
          action: 'CREATE_WALLET',
          entity: 'USER',
          details: JSON.stringify({
            email: user.email,
            name: user.name
          }),
        }
      })
      console.log('Wallet create log created successfully')
    } catch (logError) {
      console.error('Log creation error:', logError)
      // Don't return error here, user is already created
      await prisma.log.create({
        data: {
          action: 'LOG_ERROR',
          entity: 'SYSTEM',
          details: JSON.stringify({
            error: logError instanceof Error ? logError.message : 'Unknown error'
          }),
          level: 'ERROR',
        }
      })
    }
    // For now, just returning a success message
    return NextResponse.json({ message: 'Wallet created successfully' })
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}   