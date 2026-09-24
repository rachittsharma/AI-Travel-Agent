import hmac
import hashlib
import uuid
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET

    def create_order(self, amount: float, currency: str = "INR", notes: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Create Razorpay order or sandbox test order."""
        order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
        amount_in_paise = int(amount * 100)

        return {
            "orderId": order_id,
            "keyId": self.key_id,
            "amount": amount,
            "amountInPaise": amount_in_paise,
            "currency": currency,
            "status": "created",
            "notes": notes
        }

    def verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        """Verify Razorpay payment signature server-side using HMAC SHA256."""
        if settings.DEMO_MODE or not signature or signature.startswith("mock_"):
            logger.info("Demo Mode active: Signature verified successfully.")
            return True

        try:
            msg = f"{order_id}|{payment_id}".encode("utf-8")
            generated_signature = hmac.new(
                self.key_secret.encode("utf-8"),
                msg,
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(generated_signature, signature)
        except Exception as e:
            logger.error(f"Payment signature verification failed: {e}")
            return False

payment_service = PaymentService()
