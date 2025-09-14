import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// NEURAL: Utility function for conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// BRAINSAIT: HIPAA compliant logging
export function auditLog(action: string, userId: string, resourceId?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    resourceId,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    ip: 'masked', // IP should be masked for HIPAA compliance
  }
  
  // In production, send to secure audit service
  console.log('[AUDIT]', logEntry)
}

// MEDICAL: FHIR resource validation
export function validateFHIRResource(resource: any, resourceType: string): boolean {
  if (!resource || typeof resource !== 'object') return false
  if (resource.resourceType !== resourceType) return false
  if (!resource.id) return false
  
  return true
}

// BILINGUAL: RTL/LTR text direction helper
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur']
  return rtlLocales.includes(locale.split('-')[0]) ? 'rtl' : 'ltr'
}

// BRAINSAIT: Role-based permission checker
export function hasPermission(
  userRole: 'admin' | 'doctor' | 'nurse' | 'patient',
  resource: string,
  action: 'read' | 'write' | 'delete'
): boolean {
  const permissions = {
    admin: { '*': ['read', 'write', 'delete'] },
    doctor: {
      patients: ['read', 'write'],
      appointments: ['read', 'write'],
      records: ['read', 'write'],
      prescriptions: ['read', 'write']
    },
    nurse: {
      patients: ['read', 'write'],
      appointments: ['read', 'write'],
      vitals: ['read', 'write']
    },
    patient: {
      'own-records': ['read'],
      appointments: ['read']
    }
  }
  
  const userPerms = permissions[userRole]
  if (userPerms['*']?.includes(action)) return true
  
  return userPerms[resource]?.includes(action) || false
}
