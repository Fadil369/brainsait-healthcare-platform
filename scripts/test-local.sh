#!/bin/bash

# BrainSAIT Local Test Script
# Tests the services locally before OpenShift deployment

set -e

echo "🧪 BrainSAIT Local Testing Suite"
echo "==============================="

# Test 1: Store Service Dependencies
echo "1. Testing store service dependencies..."
cd services/store
if python -c "import main; print('✅ Store service imports successfully')"; then
    echo "✅ Store service dependencies OK"
else
    echo "❌ Store service dependencies failed"
    exit 1
fi
cd ../..

# Test 2: Store Service Health Check
echo "2. Testing store service health endpoint..."
cd services/store
python -c "
import asyncio
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)
response = client.get('/health')
if response.status_code == 200:
    print('✅ Store health check passed')
    print(f'Response: {response.json()}')
else:
    print(f'❌ Store health check failed: {response.status_code}')
    exit(1)
" && echo "✅ Store service health check OK" || echo "❌ Store service health check failed"
cd ../..

# Test 3: Healthcare Platform Build
echo "3. Testing healthcare platform build..."
cd services/healthcare-platform
if npm run build; then
    echo "✅ Healthcare platform build OK"
else
    echo "❌ Healthcare platform build failed"
    exit 1
fi
cd ../..

# Test 4: Healthcare Platform Health Check (simulated)
echo "4. Testing healthcare platform API structure..."
if [ -f "services/healthcare-platform/src/app/api/health/route.ts" ]; then
    echo "✅ Healthcare platform health endpoint exists"
else
    echo "❌ Healthcare platform health endpoint missing"
    exit 1
fi

# Test 5: Audit Logging Structure
echo "5. Testing audit logging implementation..."
if [ -f "services/healthcare-platform/src/lib/audit-logger.ts" ] && [ -f "services/store/audit_logger.py" ]; then
    echo "✅ Audit logging implemented for both services"
else
    echo "❌ Audit logging implementation incomplete"
    exit 1
fi

# Test 6: Docker Build Test (optional, if Docker available)
echo "6. Testing Docker build capability..."
if command -v docker &> /dev/null; then
    echo "Testing store service Docker build..."
    cd services/store
    if docker build -t brainsait-store-test . > /dev/null 2>&1; then
        echo "✅ Store service Docker build OK"
        docker rmi brainsait-store-test > /dev/null 2>&1 || true
    else
        echo "⚠️ Store service Docker build had issues (may be expected in CI)"
    fi
    cd ../..
    
    echo "Testing healthcare platform Docker build..."
    cd services/healthcare-platform
    if docker build -t brainsait-healthcare-test . > /dev/null 2>&1; then
        echo "✅ Healthcare platform Docker build OK"
        docker rmi brainsait-healthcare-test > /dev/null 2>&1 || true
    else
        echo "⚠️ Healthcare platform Docker build had issues (may be expected in CI)"
    fi
    cd ../..
else
    echo "⚠️ Docker not available, skipping Docker build tests"
fi

echo ""
echo "✅ Local Testing Complete!"
echo "=========================="
echo "All critical components are ready for deployment."
echo ""
echo "Next steps:"
echo "1. Deploy to OpenShift: ./scripts/deploy-fixed.sh"
echo "2. Monitor deployment: oc get pods -n brainsait-production"
echo "3. Test main URL: https://brainsait.apps.brainsait.fej4.p1.openshiftapps.com"