# HIPAA Audit Logging for FastAPI
import logging
import json
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import uuid4
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configure audit logger
audit_logger = logging.getLogger("brainsait.audit")
audit_logger.setLevel(logging.INFO)

# Create file handler for audit logs (in production, use secure logging service)
if not audit_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - AUDIT - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    audit_logger.addHandler(handler)


class AuditEvent:
    def __init__(
        self,
        action: str,
        resource: str,
        outcome: str = "success",
        user_id: Optional[str] = None,
        user_role: Optional[str] = None,
        resource_id: Optional[str] = None,
        source_ip: str = "unknown",
        user_agent: str = "unknown",
        session_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        phi_accessed: bool = False
    ):
        self.id = str(uuid4())
        self.timestamp = datetime.utcnow().isoformat()
        self.user_id = user_id
        self.user_role = user_role
        self.action = action
        self.resource = resource
        self.resource_id = resource_id
        self.outcome = outcome
        self.source_ip = source_ip
        self.user_agent = user_agent
        self.session_id = session_id
        self.details = details or {}
        self.phi_accessed = phi_accessed

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "user_id": self.user_id,
            "user_role": self.user_role,
            "action": self.action,
            "resource": self.resource,
            "resource_id": self.resource_id,
            "outcome": self.outcome,
            "source_ip": self.source_ip,
            "user_agent": self.user_agent,
            "session_id": self.session_id,
            "details": self.details,
            "phi_accessed": self.phi_accessed
        }

    def log(self):
        """Log the audit event"""
        audit_logger.info(json.dumps(self.to_dict(), separators=(',', ':')))


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract request information
        source_ip = request.headers.get("x-forwarded-for", 
                                      request.headers.get("x-real-ip", 
                                      request.client.host if request.client else "unknown"))
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Create audit event
        audit_event = AuditEvent(
            action="api.request",
            resource=request.url.path,
            source_ip=source_ip,
            user_agent=user_agent,
            details={
                "method": request.method,
                "path": request.url.path,
                "query": str(request.url.query) if request.url.query else None,
            }
        )

        try:
            # Process request
            response = await call_next(request)
            
            # Update audit event with response details
            audit_event.outcome = "success" if response.status_code < 400 else "failure"
            audit_event.details.update({
                "status_code": response.status_code,
                "response_time_ms": None  # Would need timing logic
            })
            
            # Log the event
            audit_event.log()
            
            return response
            
        except Exception as e:
            # Log failed request
            audit_event.outcome = "failure"
            audit_event.details.update({
                "error": str(e),
                "exception_type": type(e).__name__
            })
            audit_event.log()
            raise


# Common audit actions
class AUDIT_ACTIONS:
    # API actions
    API_REQUEST = "api.request"
    
    # Product actions
    PRODUCT_VIEW = "product.view"
    PRODUCT_CREATE = "product.create"
    PRODUCT_UPDATE = "product.update"
    PRODUCT_DELETE = "product.delete"
    
    # Order actions
    ORDER_CREATE = "order.create"
    ORDER_VIEW = "order.view"
    ORDER_UPDATE = "order.update"
    ORDER_CANCEL = "order.cancel"
    
    # Authentication
    LOGIN = "user.login"
    LOGOUT = "user.logout"
    LOGIN_FAILED = "user.login.failed"
    
    # System actions
    SYSTEM_ACCESS = "system.access"
    CONFIG_CHANGE = "system.config.change"


def log_audit_event(
    action: str,
    resource: str,
    outcome: str = "success",
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    phi_accessed: bool = False
):
    """Helper function to log audit events"""
    event = AuditEvent(
        action=action,
        resource=resource,
        outcome=outcome,
        user_id=user_id,
        resource_id=resource_id,
        details=details,
        phi_accessed=phi_accessed
    )
    event.log()