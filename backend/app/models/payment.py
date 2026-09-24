from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class PaymentCreateRequest(BaseModel):
    tripId: Optional[str] = None
    bookingType: str # "FLIGHT" | "HOTEL"
    amount: float
    currency: str = "INR"

class PaymentVerifyRequest(BaseModel):
    orderId: str
    paymentId: str
    signature: str

class PaymentResponse(BaseModel):
    id: str
    userId: str
    tripId: Optional[str] = None
    bookingType: str
    provider: str = "razorpay_test"
    razorpayOrderId: str
    razorpayPaymentId: Optional[str] = None
    amount: float
    currency: str = "INR"
    status: str = "PAYMENT_PENDING" # PAYMENT_PENDING, PAYMENT_SUCCESS, PAYMENT_FAILED
    createdAt: datetime = Field(default_factory=datetime.utcnow)
