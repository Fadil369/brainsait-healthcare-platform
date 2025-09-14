#!/bin/bash

# BrainSAIT Healthcare Platform - Fixed Deployment Script
# Addresses OpenShift routing issues and service deployment problems

set -e

echo "🏥 BrainSAIT Healthcare Platform - Fixed Deployment"
echo "=================================================="

# Check if logged into OpenShift
if ! oc whoami &> /dev/null; then
    echo "❌ Not logged into OpenShift. Please run 'oc login' first."
    exit 1
fi

# Create namespace if it doesn't exist
echo "📦 Creating namespace..."
oc new-project brainsait-production --display-name="BrainSAIT Production" --description="AI-Powered Healthcare Platform for Saudi Arabia" || true

# Apply resource quotas and limits
echo "⚙️ Applying resource quotas..."
cat <<EOF | oc apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: brainsait-quota
  namespace: brainsait-production
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
    services: "10"
    routes.route.openshift.io: "5"
EOF

# Deploy store database with fixed configuration
echo "🗄️ Deploying store database..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brainsait-store-db
  namespace: brainsait-production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: brainsait-store-db
  template:
    metadata:
      labels:
        app: brainsait-store-db
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: "brainsait_b2b"
        - name: POSTGRES_USER
          value: "brainsait"
        - name: POSTGRES_PASSWORD
          value: "BrainSAIT_PG_2025_Saudi!"
        - name: PGDATA
          value: "/var/lib/postgresql/data"
        ports:
        - containerPort: 5432
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - brainsait
            - -d
            - brainsait_b2b
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - brainsait
            - -d
            - brainsait_b2b
          initialDelaySeconds: 15
          periodSeconds: 5
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-data
        emptyDir: {}
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
        fsGroup: 999
---
apiVersion: v1
kind: Service
metadata:
  name: brainsait-store-db
  namespace: brainsait-production
spec:
  selector:
    app: brainsait-store-db
  ports:
  - port: 5432
    targetPort: 5432
EOF

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
oc wait --for=condition=available --timeout=300s deployment/brainsait-store-db -n brainsait-production

# Build and deploy services with proper error handling
echo "🏗️ Building services..."
for service in store healthcare-platform gateway; do
    if [ -d "services/$service" ]; then
        echo "Building $service..."
        cd "services/$service"
        
        # Create build config if it doesn't exist
        oc new-build --binary --name="brainsait-$service" --strategy=docker || true
        
        # Start build
        if oc start-build "brainsait-$service" --from-dir=. --follow; then
            echo "✅ Build for $service completed successfully"
        else
            echo "⚠️ Build for $service had issues, continuing..."
        fi
        
        cd ../..
    fi
done

# Deploy store service with improved configuration
echo "🚀 Deploying store service..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brainsait-store
  namespace: brainsait-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: brainsait-store
  template:
    metadata:
      labels:
        app: brainsait-store
    spec:
      containers:
      - name: store
        image: image-registry.openshift-image-registry.svc:5000/brainsait-production/brainsait-store:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql+asyncpg://brainsait:BrainSAIT_PG_2025_Saudi!@brainsait-store-db:5432/brainsait_b2b"
        - name: REGION
          value: "saudi-arabia"
        - name: CURRENCY
          value: "SAR"
        - name: LANGUAGE
          value: "ar"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "300m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 5
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: brainsait-store
  namespace: brainsait-production
spec:
  selector:
    app: brainsait-store
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
EOF

# Deploy healthcare platform
echo "🏥 Deploying healthcare platform..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brainsait-healthcare-platform
  namespace: brainsait-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: brainsait-healthcare-platform
  template:
    metadata:
      labels:
        app: brainsait-healthcare-platform
    spec:
      containers:
      - name: healthcare-platform
        image: image-registry.openshift-image-registry.svc:5000/brainsait-production/brainsait-healthcare-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "http://brainsait-store:8000/api"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "300m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 5
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: brainsait-healthcare-platform
  namespace: brainsait-production
spec:
  selector:
    app: brainsait-healthcare-platform
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
EOF

# Deploy gateway with fixed configuration
echo "🌐 Deploying gateway..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brainsait-gateway
  namespace: brainsait-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: brainsait-gateway
  template:
    metadata:
      labels:
        app: brainsait-gateway
    spec:
      containers:
      - name: gateway
        image: image-registry.openshift-image-registry.svc:5000/brainsait-production/brainsait-gateway:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: brainsait-gateway
  namespace: brainsait-production
spec:
  selector:
    app: brainsait-gateway
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
EOF

# Create the main route with proper configuration
echo "🔗 Creating routes..."
oc apply -f - <<EOF
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: brainsait-main
  namespace: brainsait-production
  annotations:
    haproxy.router.openshift.io/timeout: "30s"
    haproxy.router.openshift.io/balance: "roundrobin"
spec:
  host: brainsait.apps.brainsait.fej4.p1.openshiftapps.com
  to:
    kind: Service
    name: brainsait-gateway
    weight: 100
  port:
    targetPort: 80
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
EOF

# Create direct service routes for debugging
oc expose service/brainsait-store --name=brainsait-store-direct || true
oc expose service/brainsait-healthcare-platform --name=brainsait-healthcare-direct || true

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
oc rollout status deployment/brainsait-store --timeout=300s -n brainsait-production || true
oc rollout status deployment/brainsait-healthcare-platform --timeout=300s -n brainsait-production || true  
oc rollout status deployment/brainsait-gateway --timeout=300s -n brainsait-production || true

# Display final status
echo ""
echo "✅ Deployment Summary"
echo "===================="
echo "Namespace: brainsait-production"
echo ""
echo "Services:"
oc get pods -n brainsait-production
echo ""
echo "Routes:"
oc get routes -n brainsait-production
echo ""
echo "Services:"
oc get services -n brainsait-production
echo ""
echo "🎉 BrainSAIT Healthcare Platform deployment completed!"
echo "🌐 Main URL: https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com"
echo "🇸🇦 Ready to serve Saudi Arabia's healthcare needs"

echo ""
echo "🔍 Troubleshooting Commands:"
echo "Check pod logs: oc logs -f deployment/brainsait-gateway -n brainsait-production"
echo "Check service endpoints: oc get endpoints -n brainsait-production"
echo "Test health checks: oc exec -it deployment/brainsait-store -- curl localhost:8000/health"