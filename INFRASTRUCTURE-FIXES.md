# 🔧 BrainSAIT Infrastructure Fixes - Deployment Guide

## Issues Resolved

### 1. OpenShift Route Configuration Fixed ✅

**Problem:** The main route `brainsait.apps.brainsait.fej4.p1.openshiftapps.com` was returning "Application is not available" errors.

**Root Causes Identified:**
- Healthcare platform Dockerfile was incorrectly configured for static hosting instead of Next.js server
- Gateway nginx configuration was routing everything to store service instead of healthcare platform
- Missing health check endpoints causing readiness probe failures
- Improper Docker image builds and service configurations

**Solutions Implemented:**
- ✅ Updated healthcare platform Dockerfile to use Next.js standalone build
- ✅ Fixed next.config.js to output standalone server instead of static export
- ✅ Corrected gateway routing to prioritize healthcare platform as main app
- ✅ Added comprehensive health check endpoints (`/api/health`)
- ✅ Implemented proper OpenShift deployment manifests with security contexts

### 2. Service Deployment Issues Fixed ✅

**Problem:** Healthcare platform and gateway pods were experiencing CrashLoopBackOff and deployment failures.

**Solutions:**
- ✅ Fixed all Dockerfile configurations with proper multi-stage builds
- ✅ Added proper health checks and readiness probes
- ✅ Implemented security contexts (runAsNonRoot: true, runAsUser: 1001)
- ✅ Added resource limits and requests for all services
- ✅ Created comprehensive deployment script with error handling

### 3. HIPAA Audit Logging Implemented ✅

**Requirement:** Implement comprehensive audit trail for healthcare compliance.

**Implementation:**
- ✅ Created TypeScript audit logger for frontend with all required HIPAA fields
- ✅ Implemented Python audit middleware for FastAPI backend
- ✅ Added audit API endpoints for logging and querying events
- ✅ Automatic request/response logging for all API calls
- ✅ Includes user ID, action, resource, outcome, IP address, timestamp, etc.

## Deployment Instructions

### Option 1: Use Fixed Deployment Script (Recommended)

```bash
# From repository root
./scripts/deploy-fixed.sh
```

### Option 2: Manual Step-by-Step Deployment

1. **Login to OpenShift:**
```bash
oc login <your-cluster-url>
```

2. **Create/Switch to Production Namespace:**
```bash
oc new-project brainsait-production || oc project brainsait-production
```

3. **Build Services:**
```bash
# Store service
cd services/store
oc new-build --binary --name=brainsait-store --strategy=docker
oc start-build brainsait-store --from-dir=. --follow

# Healthcare platform
cd ../healthcare-platform  
oc new-build --binary --name=brainsait-healthcare-platform --strategy=docker
oc start-build brainsait-healthcare-platform --from-dir=. --follow

# Gateway
cd ../gateway
oc new-build --binary --name=brainsait-gateway --strategy=docker
oc start-build brainsait-gateway --from-dir=. --follow
```

4. **Deploy Database:**
```bash
oc apply -f - <<EOF
[Database deployment YAML from deploy-fixed.sh]
EOF
```

5. **Deploy Services:**
```bash
# Apply the deployment YAMLs from the script
```

6. **Create Routes:**
```bash
oc expose service/brainsait-gateway --name=brainsait-main
```

## Service Architecture

```
Internet → OpenShift Route → Gateway (Nginx) → {
  / → Healthcare Platform (Next.js :3000)
  /store/ → Store Service (FastAPI :8000)
  /api/ → Store Service API (FastAPI :8000)
}
```

## Health Check Endpoints

- **Gateway:** `GET /health` → Returns "healthy"
- **Healthcare Platform:** `GET /api/health` → Returns JSON health status
- **Store Service:** `GET /health` → Returns JSON health status
- **Store Service:** `GET /ready` → Returns JSON readiness status

## Audit Logging Endpoints

- **Log Event:** `POST /api/audit` → Log new audit event
- **Query Logs:** `GET /api/audit?userId=xxx&action=xxx` → Query audit logs

## Troubleshooting Commands

### Check Pod Status
```bash
oc get pods -n brainsait-production
oc describe pod <pod-name> -n brainsait-production
```

### Check Logs
```bash
oc logs -f deployment/brainsait-gateway -n brainsait-production
oc logs -f deployment/brainsait-healthcare-platform -n brainsait-production
oc logs -f deployment/brainsait-store -n brainsait-production
```

### Check Routes and Services
```bash
oc get routes -n brainsait-production
oc get services -n brainsait-production
oc get endpoints -n brainsait-production
```

### Test Health Checks
```bash
# Test from inside cluster
oc exec -it deployment/brainsait-store -- curl localhost:8000/health
oc exec -it deployment/brainsait-healthcare-platform -- curl localhost:3000/api/health
oc exec -it deployment/brainsait-gateway -- curl localhost/health
```

### Test External Route
```bash
curl -I https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com/health
curl https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com/api/health
```

## Expected Results

After successful deployment:

1. **Main URL Accessible:** `https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com` → Healthcare Platform
2. **Store Service:** `https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com/store/` → Store API
3. **API Endpoints:** `https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com/api/` → Store API
4. **Health Checks:** All services responding with 200 OK
5. **Audit Logging:** All requests automatically logged for HIPAA compliance

## Security Features

- ✅ All containers run as non-root user (1001)
- ✅ Security contexts properly configured
- ✅ HIPAA audit logging for all actions
- ✅ TLS termination at route level
- ✅ Resource limits to prevent resource exhaustion
- ✅ Proper health checks for high availability

## Performance Features

- ✅ Next.js standalone build for optimal performance
- ✅ Nginx gateway for efficient request routing
- ✅ Multiple replicas for high availability
- ✅ Resource optimization for cost efficiency
- ✅ Proper caching headers for static assets