'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  titleEn: string
  icon: LucideIcon
  color: 'medical' | 'signal' | 'accent' | 'midnight'
  count: string
  trend: string
  href: string
  userRole: 'admin' | 'doctor' | 'nurse' | 'patient'
}

// NEURAL: Glass morphism card with BrainSAIT colors
export function DashboardCard({
  title,
  titleEn,
  icon: Icon,
  color,
  count,
  trend,
  href,
  userRole
}: DashboardCardProps) {
  
  const colorClasses = {
    medical: 'from-medical-500/20 to-medical-600/10 border-medical-400/30 hover:border-medical-400/50',
    signal: 'from-signal-500/20 to-signal-600/10 border-signal-400/30 hover:border-signal-400/50',
    accent: 'from-accent-500/20 to-accent-600/10 border-accent-400/30 hover:border-accent-400/50',
    midnight: 'from-midnight-500/20 to-midnight-600/10 border-midnight-400/30 hover:border-midnight-400/50'
  }

  const iconColors = {
    medical: 'text-medical-400',
    signal: 'text-signal-400',
    accent: 'text-accent-400',
    midnight: 'text-midnight-400'
  }

  // BRAINSAIT: Role-based access control
  const hasAccess = userRole === 'admin' || 
    (userRole === 'doctor' && !href.includes('admin')) ||
    (userRole === 'nurse' && ['patients', 'appointments', 'records'].some(path => href.includes(path)))

  if (!hasAccess) {
    return (
      <div className="opacity-50 cursor-not-allowed">
        <CardContent />
      </div>
    )
  }

  function CardContent() {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br backdrop-blur-md border transition-all duration-300 hover:scale-105 group',
        colorClasses[color]
      )}>
        {/* NEURAL: Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6">
          {/* Icon and trend */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn('p-3 rounded-xl bg-white/10 backdrop-blur-sm', iconColors[color])}>
              <Icon className="w-6 h-6" />
            </div>
            
            <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              {trend}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white text-right">
              {title}
            </h3>
            <p className="text-sm text-white/60 text-right">
              {titleEn}
            </p>
            <p className="text-2xl font-bold text-white">
              {count}
            </p>
          </div>

          {/* MEDICAL: Compliance indicator */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60">HIPAA Compliant</span>
            </div>
            
            <span className="text-xs text-white/40">
              {new Date().toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
      >
        <CardContent />
      </motion.div>
    </Link>
  )
}
