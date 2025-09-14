'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Brain, 
  Shield, 
  Globe,
  Stethoscope,
  Heart,
  Pill,
  UserCheck,
  BarChart3
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { HealthcareMetrics } from '@/components/dashboard/HealthcareMetrics'

// BRAINSAIT: Main healthcare dashboard with HIPAA compliance
export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userRole] = useState<'admin' | 'doctor' | 'nurse' | 'patient'>('doctor')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // BILINGUAL: Arabic/English content
  const content = {
    ar: {
      title: 'منصة BrainSAIT الطبية',
      subtitle: 'نظام إدارة الرعاية الصحية المدعوم بالذكاء الاصطناعي',
      welcome: 'مرحباً بك في نظام الرعاية الصحية المتقدم',
      time: 'الوقت الحالي',
    },
    en: {
      title: 'BrainSAIT Healthcare Platform',
      subtitle: 'AI-Powered Healthcare Management System',
      welcome: 'Welcome to Advanced Healthcare System',
      time: 'Current Time',
    }
  }

  const modules = [
    {
      id: 'patients',
      title: 'إدارة المرضى',
      titleEn: 'Patient Management',
      icon: Users,
      color: 'medical',
      count: '2,847',
      trend: '+12%',
      href: '/patients'
    },
    {
      id: 'appointments',
      title: 'المواعيد',
      titleEn: 'Appointments',
      icon: Calendar,
      color: 'signal',
      count: '156',
      trend: '+8%',
      href: '/appointments'
    },
    {
      id: 'records',
      title: 'السجلات الطبية',
      titleEn: 'Medical Records',
      icon: FileText,
      color: 'accent',
      count: '8,921',
      trend: '+15%',
      href: '/records'
    },
    {
      id: 'ai-insights',
      title: 'رؤى الذكاء الاصطناعي',
      titleEn: 'AI Insights',
      icon: Brain,
      color: 'midnight',
      count: '47',
      trend: '+23%',
      href: '/ai-insights'
    },
    {
      id: 'diagnostics',
      title: 'التشخيص',
      titleEn: 'Diagnostics',
      icon: Stethoscope,
      color: 'medical',
      count: '234',
      trend: '+5%',
      href: '/diagnostics'
    },
    {
      id: 'pharmacy',
      title: 'الصيدلية',
      titleEn: 'Pharmacy',
      icon: Pill,
      color: 'signal',
      count: '1,456',
      trend: '+18%',
      href: '/pharmacy'
    }
  ]

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* NEURAL: Glass morphism header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {content.ar.title}
            </h1>
            <p className="text-lg text-white/80">
              {content.ar.subtitle}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-white/60 mb-1">{content.ar.time}</p>
            <p className="text-lg font-mono text-signal-400">
              {currentTime.toLocaleString('ar-SA', {
                timeZone: 'Asia/Riyadh',
                hour12: false
              })}
            </p>
          </div>
        </div>
      </motion.header>

      {/* MEDICAL: Healthcare statistics */}
      <StatsGrid userRole={userRole} />

      {/* BRAINSAIT: Main modules grid */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-right">
          الوحدات الطبية الرئيسية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <DashboardCard
                title={module.title}
                titleEn={module.titleEn}
                icon={module.icon}
                color={module.color}
                count={module.count}
                trend={module.trend}
                href={module.href}
                userRole={userRole}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* MEDICAL: Healthcare metrics and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HealthcareMetrics userRole={userRole} />
        <RecentActivity userRole={userRole} />
      </div>

      {/* BRAINSAIT: Quick actions */}
      <QuickActions userRole={userRole} />
    </div>
  )
}
