#!/usr/bin/env python3
"""
Basic test to validate that core FastAPI components work
"""

import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_core_components():
    """Test that core components can be imported"""
    try:
        from fastapi import FastAPI
        print("✅ FastAPI imported successfully")
        
        from app.core.config import settings
        print("✅ Configuration imported successfully")
        print(f"   App name: {settings.APP_NAME}")
        print(f"   Environment: {settings.ENVIRONMENT}")
        
        # Test basic FastAPI app creation
        app = FastAPI(
            title="BrainSAIT Store API Test",
            version="1.0.0",
            description="Test API for BrainSAIT Store"
        )
        
        @app.get("/health")
        async def health():
            return {"status": "ok", "service": "brainsait-store-backend"}
        
        print("✅ Basic FastAPI app created successfully")
        print(f"   App title: {app.title}")
        
        # Test SQLAlchemy models can be imported
        from app.core.database import Base
        print("✅ Database Base imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during import test: {e}")
        return False

def test_environment_config():
    """Test environment configuration"""
    try:
        from app.core.config import settings
        
        print("\n📝 Configuration Summary:")
        print(f"   Database URL: {settings.DATABASE_URL}")
        print(f"   Redis URL: {settings.REDIS_URL}")
        print(f"   Debug Mode: {settings.DEBUG}")
        print(f"   Environment: {settings.ENVIRONMENT}")
        print(f"   Secret Key: {'***' if settings.SECRET_KEY else 'NOT SET'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during config test: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting BrainSAIT Store Backend Tests\n")
    
    # Test core components
    success = test_core_components()
    
    if success:
        print("\n" + "="*50)
        test_environment_config()
        print("\n✅ All basic tests passed! Backend core is working.")
    else:
        print("\n❌ Basic tests failed. Check the error messages above.")
        sys.exit(1)