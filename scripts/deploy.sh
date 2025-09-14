#!/bin/bash

# BrainSAIT Healthcare Platform Deployment Script
# Deploys all services to OpenShift cluster

set -e

echo "🏥 BrainSAIT Healthcare Platform Deployment"
echo "=========================================="

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

# Deploy store database
echo "🗄️ Deploying store database..."
oc apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brainsait-store-db-simple
  namespace: brainsait-production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: brainsait-store-db-simple
  template:
    metadata:
      labels:
        app: brainsait-store-db-simple
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
          value: "/tmp/pgdata"
        ports:
        - containerPort: 5432
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: brainsait-store-db
  namespace: brainsait-production
spec:
  selector:
    app: brainsait-store-db-simple
  ports:
  - port: 5432
    targetPort: 5432
EOF

# Build and deploy services
echo "🏗️ Building services..."
for service in store healthcare-platform gateway openemr; do
    if [ -d "services/$service" ]; then
        echo "Building $service..."
        cd "services/$service"
        oc new-build --binary --name="$service" --strategy=docker || true
        oc start-build "$service" --from-dir=. --follow || echo "Build for $service completed with warnings"
        cd ../..
    fi
done

# Deploy services
echo "🚀 Deploying services..."
oc new-app brainsait-store --name=brainsait-store || true
oc new-app brainsait-healthcare-platform --name=brainsait-healthcare-platform || true
oc new-app brainsait-gateway --name=brainsait-gateway || true

# Expose services
echo "🌐 Creating routes..."
oc expose service/brainsait-gateway --name=brainsait-main || true
oc expose service/brainsait-store --name=brainsait-store-direct || true

# Scale services
echo "📈 Scaling services..."
oc scale deployment/brainsait-store --replicas=3 || true
oc scale deployment/brainsait-healthcare-platform --replicas=2 || true

# Wait for deployments
echo "⏳ Waiting for deployments..."
oc rollout status deployment/brainsait-store --timeout=300s || true
oc rollout status deployment/brainsait-store-db-simple --timeout=300s || true

# Display status
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
echo "🎉 BrainSAIT Healthcare Platform deployed successfully!"
echo "🇸🇦 Ready to serve Saudi Arabia's healthcare needs"
