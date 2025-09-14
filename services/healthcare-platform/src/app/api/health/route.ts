import { NextResponse } from 'next/server'

export async function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'brainsait-healthcare-platform',
    version: '2.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
  }

  return NextResponse.json(healthData, { status: 200 })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}