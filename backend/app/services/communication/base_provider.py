from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class MessagePayload(BaseModel):
    recipient: str  # Phone number with country code (+971...) or email address
    recipient_name: str
    body: str
    subject: Optional[str] = None
    template_name: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = None
    media_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ProviderResponse(BaseModel):
    success: bool
    provider: str
    provider_message_id: str
    status: str  # QUEUED, SENT, DELIVERED, FAILED
    error_message: Optional[str] = None
    timestamp: datetime = datetime.utcnow()
    raw_response: Optional[Dict[str, Any]] = None

class BaseCommunicationProvider(ABC):
    """
    Abstract Base Class for Multi-Channel Communication Providers.
    """
    def __init__(self, provider_name: str):
        self.provider_name = provider_name

    @abstractmethod
    async def send_message(self, payload: MessagePayload) -> ProviderResponse:
        pass

    @abstractmethod
    async def get_delivery_status(self, provider_message_id: str) -> str:
        pass
