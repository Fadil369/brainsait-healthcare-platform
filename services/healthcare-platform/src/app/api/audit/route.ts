import { NextRequest, NextResponse } from 'next/server'
import { auditLogger, AUDIT_ACTIONS } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  try {
    // Log the audit query access
    await auditLogger.log({
      action: AUDIT_ACTIONS.SYSTEM_ACCESS,
      resource: 'audit_logs',
      outcome: 'success',
      sourceIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        endpoint: '/api/audit',
        access_type: 'query'
      }
    })

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build filters
    const filters: any = {}
    if (userId) filters.userId = userId
    if (action) filters.action = action
    if (resource) filters.resource = resource

    // Query audit logs
    const logs = await auditLogger.query(filters)
    
    // Return limited results (for performance)
    const limitedLogs = logs.slice(0, limit)

    return NextResponse.json({
      success: true,
      count: limitedLogs.length,
      total: logs.length,
      logs: limitedLogs,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Audit log query error:', error)
    
    await auditLogger.log({
      action: AUDIT_ACTIONS.SYSTEM_ACCESS,
      resource: 'audit_logs',
      outcome: 'failure',
      sourceIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        endpoint: '/api/audit',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to query audit logs',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.action || !body.resource) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: action, resource' 
        },
        { status: 400 }
      )
    }

    // Log the audit event
    await auditLogger.log({
      userId: body.userId,
      userRole: body.userRole,
      action: body.action,
      resource: body.resource,
      resourceId: body.resourceId,
      outcome: body.outcome || 'success',
      sourceIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: body.sessionId,
      details: body.details,
      phiAccessed: body.phiAccessed || false
    })

    return NextResponse.json({
      success: true,
      message: 'Audit event logged successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Audit logging error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log audit event',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}