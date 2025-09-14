# 🏥 BrainSAIT Healthcare Platform

**AI-Powered Enterprise Healthcare Management System for Saudi Arabia & Middle East**

[![OpenShift](https://img.shields.io/badge/OpenShift-ROSA-red)](https://www.redhat.com/en/technologies/cloud-computing/openshift)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-green)](https://www.hhs.gov/hipaa)
[![NPHIES](https://img.shields.io/badge/NPHIES-Ready-blue)](https://nphies.sa)
[![Arabic](https://img.shields.io/badge/Language-Arabic%2FEnglish-orange)](https://www.iso.org/iso-639-language-codes.html)

## 🌟 Overview

BrainSAIT is a comprehensive healthcare platform designed specifically for the Saudi Arabian and Middle Eastern markets. It combines modern web technologies with AI-powered healthcare workflows, ensuring full compliance with HIPAA, NPHIES, and local regulations.

## 🏗️ Architecture

### **Microservices Design**
- **Healthcare Platform**: Patient management, medical records, AI insights
- **Store Service**: Medical equipment e-commerce with Arabic support
- **OpenEMR Integration**: Electronic medical records system
- **API Gateway**: Centralized routing and security

### **Technology Stack**
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, PostgreSQL, MySQL
- **Infrastructure**: OpenShift (ROSA), Docker, Kubernetes
- **AI/ML**: LangChain, OpenAI, Anthropic integration
- **Compliance**: HIPAA audit logging, NPHIES integration

## 🎨 Design System

### **BrainSAIT Colors**
- **Midnight Blue**: `#1a365d` (Primary)
- **Medical Blue**: `#2b6cb8` (Secondary)
- **Signal Teal**: `#0ea5e9` (Accent)
- **Deep Orange**: `#ea580c` (Warning)
- **Professional Gray**: `#64748b` (Neutral)

### **UI Features**
- Glass morphism effects with mesh gradients
- RTL/LTR adaptive layouts for Arabic/English
- Mobile-first responsive design
- 60fps animations and transitions
- Accessibility compliant (WCAG 2.1)

## 🇸🇦 Saudi Market Features

### **Localization**
- **Arabic Language**: Full RTL support with IBM Plex Arabic fonts
- **Currency**: Saudi Riyal (SAR) primary, multi-currency support
- **Timezone**: Asia/Riyadh with Islamic calendar integration
- **Cultural**: Weekend settings, prayer times, cultural adaptations

### **Compliance**
- **NPHIES Integration**: Saudi health insurance interoperability
- **MOH Standards**: Ministry of Health compliance
- **Data Residency**: Saudi Arabia data protection laws
- **Payment Gateways**: MADA, STC Pay, Visa/Mastercard

## 🚀 Quick Start

### **Prerequisites**
- OpenShift CLI (`oc`)
- Docker
- Node.js 18+
- Python 3.9+

### **Deployment**
```bash
# Clone repository
git clone https://github.com/yourusername/brainsait-healthcare-platform.git
cd brainsait-healthcare-platform

# Deploy to OpenShift
oc login <your-cluster-url>
oc new-project brainsait-production
oc apply -f infrastructure/

# Build and deploy services
./scripts/deploy.sh
```

### **Local Development**
```bash
# Start store service
cd services/store
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Start frontend
cd services/healthcare-platform
npm install
npm run dev
```

## 📁 Project Structure

```
brainsait-best-build/
├── services/
│   ├── healthcare-platform/    # Next.js frontend
│   ├── store/                  # FastAPI e-commerce
│   ├── openemr/               # Medical records
│   └── gateway/               # Nginx routing
├── infrastructure/
│   ├── kubernetes/            # K8s manifests
│   ├── openshift/            # OpenShift configs
│   └── monitoring/           # Observability
├── frontend/                 # React components
│   ├── components/           # UI components
│   ├── pages/               # Next.js pages
│   └── styles/              # Tailwind CSS
└── docs/                    # Documentation
```

## 🏥 Healthcare Features

### **Core Modules**
- **Patient Management**: Registration, demographics, insurance
- **Appointments**: Scheduling, reminders, calendar integration
- **Medical Records**: FHIR R4 compliant, HL7 integration
- **Prescriptions**: E-prescribing, drug interactions, pharmacy
- **Diagnostics**: Lab results, radiology, pathology
- **AI Insights**: Clinical decision support, predictive analytics

### **BrainSAIT AI Agents**
- **MASTERLINC**: Orchestration and workflow management
- **HEALTHCARELINC**: Clinical workflows and protocols
- **CLINICALLINC**: Decision support and diagnostics
- **COMPLIANCELINC**: Audit trails and regulatory compliance
- **TTLINC**: Translation and localization services

## 🔒 Security & Compliance

### **HIPAA Compliance**
- End-to-end encryption for PHI
- Role-based access controls (RBAC)
- Comprehensive audit logging
- Secure data transmission (TLS 1.3)
- Regular security assessments

### **Saudi Regulations**
- NPHIES interoperability standards
- Arabic clinical terminology (SNOMED CT-AR)
- Local data residency requirements
- MOH reporting and compliance

## 🌐 API Documentation

### **Store Service Endpoints**
```
GET  /api/products          # Product catalog (Arabic/English)
POST /api/orders            # Create order (SAR currency)
GET  /api/orders/{id}       # Order details
GET  /health                # Health check
```

### **Healthcare Platform**
```
GET  /api/patients          # Patient list (FHIR R4)
POST /api/appointments      # Schedule appointment
GET  /api/records/{id}      # Medical record
POST /api/prescriptions     # E-prescribe
```

## 📊 Monitoring & Analytics

### **Observability**
- Prometheus metrics collection
- Grafana dashboards
- ELK stack for log aggregation
- Jaeger distributed tracing
- Custom healthcare KPIs

### **Performance**
- <2.5s page load times
- 60fps UI animations
- <100MB memory usage per service
- Auto-scaling based on demand

## 🛠️ Development

### **Code Standards**
- **TypeScript**: Strict typing, functional React patterns
- **Python**: Type hints, FastAPI conventions, snake_case
- **Swift**: PascalCase types, camelCase variables, MVVM
- **Healthcare**: FHIR R4 naming, clinical terminology compliance

### **Testing**
```bash
# Backend tests
cd services/store
pytest tests/

# Frontend tests
cd services/healthcare-platform
npm test

# Integration tests
./scripts/test-integration.sh
```

## 🚀 Deployment Status

### **Production Environment**
- **Cluster**: OpenShift Service on AWS (ROSA)
- **Region**: Middle East (Bahrain) - me-south-1
- **Namespace**: `brainsait-production`
- **URL**: https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com

### **Current Status**
- ✅ Store Service: 3/3 pods running
- ✅ Database: PostgreSQL operational
- ✅ OpenEMR DB: MySQL running
- ✅ Frontend: Built and ready
- ⚠️ Routes: Configuration in progress

## 📈 Roadmap

### **Phase 1: Core Platform** ✅
- [x] Microservices architecture
- [x] Arabic/English localization
- [x] HIPAA compliance framework
- [x] Basic healthcare modules

### **Phase 2: AI Integration** 🔄
- [ ] Clinical decision support
- [ ] Predictive analytics
- [ ] Natural language processing (Arabic)
- [ ] Image analysis (radiology)

### **Phase 3: Market Expansion** 📋
- [ ] Multi-tenant architecture
- [ ] Additional MENA countries
- [ ] Advanced analytics dashboard
- [ ] Mobile applications (iOS/Android)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Development Guidelines**
- Follow FHIR R4 standards for healthcare data
- Ensure Arabic RTL support in all UI components
- Include comprehensive tests for new features
- Document API changes in OpenAPI format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.brainsait.com](https://docs.brainsait.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/brainsait-healthcare-platform/issues)
- **Email**: support@brainsait.com
- **Slack**: [BrainSAIT Community](https://brainsait.slack.com)

## 🏆 Acknowledgments

- Saudi Ministry of Health for regulatory guidance
- NPHIES team for interoperability standards
- OpenShift community for container platform
- Healthcare IT professionals in Saudi Arabia

---

**Built with ❤️ for Saudi Arabia's healthcare transformation**

🇸🇦 **المملكة العربية السعودية** | **Kingdom of Saudi Arabia**
