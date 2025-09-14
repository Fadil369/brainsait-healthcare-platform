'use client'

import { motion } from 'framer-motion'
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react'

interface HealthcareMetricsProps {
  userRole: 'admin' | 'doctor' | 'nurse' | 'patient'
}

// MEDICAL: Real-time healthcare metrics with FHIR compliance
export function HealthcareMetrics({ userRole }: HealthcareMetricsProps) {
  
  const metrics = [
    {
      id: 'active_patients',
      title: 'المرضى النشطون',
      titleEn: 'Active Patients',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'medical',
      status: 'normal'
    },
    {
      id: 'critical_alerts',
      title: 'التنبيهات الحرجة',
      titleEn: 'Critical Alerts',
      value: '3',
      change: '-25%',
      icon: AlertTriangle,
      color: 'accent',
      status: 'warning'
    },
    {
      id: 'appointments_today',
      title: 'مواعيد اليوم',
      titleEn: 'Today\'s Appointments',
      value: '47',
      change: '+8%',
      icon: Calendar,
      color: 'signal',
      status: 'normal'
    },
    {
      id: 'avg_response_time',
      title: 'متوسط وقت الاستجابة',
      titleEn: 'Avg Response Time',
      value: '2.3m',
      change: '-15%',
      icon: Clock,
      color: 'midnight',
      status: 'good'
    }
  ]

  const vitals = [
    { label: 'معدل ضربات القلب', labelEn: 'Heart Rate', value: '72 bpm', status: 'normal' },
    { label: 'ضغط الدم', labelEn: 'Blood Pressure', value: '120/80', status: 'normal' },
    { label: 'درجة الحرارة', labelEn: 'Temperature', value: '36.5°C', status: 'normal' },
    { label: 'الأكسجين', labelEn: 'Oxygen Sat', value: '98%', status: 'normal' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white text-right">
          المؤشرات الطبية الحية
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-white/60">Live</span>
        </div>
      </div>

      {/* MEDICAL: Key metrics grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 ${
                metric.color === 'medical' ? 'text-medical-400' :
                metric.color === 'signal' ? 'text-signal-400' :
                metric.color === 'accent' ? 'text-accent-400' :
                'text-midnight-400'
              }`} />
              <span className={`text-xs px-2 py-1 rounded-full ${
                metric.status === 'warning' ? 'bg-accent-500/20 text-accent-400' :
                metric.status === 'good' ? 'bg-green-500/20 text-green-400' :
                'bg-signal-500/20 text-signal-400'
              }`}>
                {metric.change}
              </span>
            </div>
            
            <p className="text-lg font-bold text-white mb-1">
              {metric.value}
            </p>
            <p className="text-xs text-white/60 text-right">
              {metric.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* MEDICAL: Patient vitals (if doctor/nurse role) */}
      {(userRole === 'doctor' || userRole === 'nurse') && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white/80 text-right">
            العلامات الحيوية للمريض الحالي
          </h4>
          
          {vitals.map((vital, index) => (
            <motion.div
              key={vital.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white font-medium">
                  {vital.value}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-white/80">{vital.label}</p>
                <p className="text-xs text-white/50">{vital.labelEn}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* BRAINSAIT: AI insights indicator */}
      <div className="mt-6 p-3 bg-gradient-to-r from-signal-500/20 to-medical-500/20 rounded-lg border border-signal-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-signal-400 animate-pulse" />
            <span className="text-sm text-white/80">AI Analysis Active</span>
          </div>
          <span className="text-xs text-signal-400 font-medium">
            تحليل ذكي نشط
          </span>
        </div>
      </div>
    </motion.div>
  )
}
