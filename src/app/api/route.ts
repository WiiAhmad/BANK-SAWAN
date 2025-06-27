import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Example of a simple GET request handler
    const data = { message: 'Hello, World!' }
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in GET handler:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}