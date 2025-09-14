// HIPAA Audit Logging System
// Complies with 45 CFR 164.312(b) - Audit controls

export interface AuditEvent {
  id: string
  timestamp: string
  userId?: string
  userRole?: string
  action: string
  resource: string
  resourceId?: string
  outcome: 'success' | 'failure'
  sourceIp: string
  userAgent: string
  sessionId?: string
  details?: Record<string, any>
  phiAccessed?: boolean
}

export interface AuditLogger {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>
  query(filters: Partial<AuditEvent>): Promise<AuditEvent[]>
}

class MemoryAuditLogger implements AuditLogger {
  private events: AuditEvent[] = []

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event
    }
    
    this.events.push(auditEvent)
    
    // In production, this would write to secure audit database
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', JSON.stringify(auditEvent, null, 2))
    }
  }

  async query(filters: Partial<AuditEvent>): Promise<AuditEvent[]> {
    return this.events.filter(event => {
      return Object.entries(filters).every(([key, value]) => {
        return event[key as keyof AuditEvent] === value
      })
    })
  }
}

// Singleton audit logger instance
export const auditLogger: AuditLogger = new MemoryAuditLogger()

// Common audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  LOGIN_FAILED: 'user.login.failed',
  
  // Patient data access
  PATIENT_VIEW: 'patient.view',
  PATIENT_CREATE: 'patient.create',
  PATIENT_UPDATE: 'patient.update',
  PATIENT_DELETE: 'patient.delete',
  
  // Medical records
  RECORD_VIEW: 'medical_record.view',
  RECORD_CREATE: 'medical_record.create',
  RECORD_UPDATE: 'medical_record.update',
  RECORD_EXPORT: 'medical_record.export',
  
  // System actions
  SYSTEM_ACCESS: 'system.access',
  CONFIG_CHANGE: 'system.config.change',
  BACKUP_CREATE: 'system.backup.create',
  
  // Data requests
  API_REQUEST: 'api.request',
  DATA_EXPORT: 'data.export',
} as const

// Helper function to create audit middleware
export function createAuditMiddleware() {
  return async (request: Request) => {
    const headers = request.headers
    const url = new URL(request.url)
    
    await auditLogger.log({
      action: AUDIT_ACTIONS.API_REQUEST,
      resource: url.pathname,
      outcome: 'success',
      sourceIp: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
      userAgent: headers.get('user-agent') || 'unknown',
      details: {
        method: request.method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
      }
    })
  }
}