import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.models.payment import PaymentCreateRequest, PaymentVerifyRequest, PaymentResponse
from app.models.user import UserResponse
from app.services.auth_service import get_current_user
from app.services.payment_service import payment_service
from app.database import db_manager

router = APIRouter(prefix="/api/payments", tags=["Payments Gateway"])

@router.post("/create")
async def create_payment_order(
    req: PaymentCreateRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    order = payment_service.create_order(
        amount=req.amount,
        currency=req.currency,
        notes={"userId": current_user.id, "bookingType": req.bookingType}
    )

    payment_record = {
        "_id": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "userId": current_user.id,
        "tripId": req.tripId,
        "bookingType": req.bookingType,
        "provider": "razorpay_test",
        "razorpayOrderId": order["orderId"],
        "amount": req.amount,
        "currency": req.currency,
        "status": "PAYMENT_PENDING",
        "createdAt": datetime.utcnow()
    }

    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.payments.insert_one(payment_record)
    else:
        db_manager.in_memory_store["payments"][payment_record["id"]] = payment_record

    return order

@router.post("/verify")
async def verify_payment(
    req: PaymentVerifyRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    is_valid = payment_service.verify_signature(req.orderId, req.paymentId, req.signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    # Update payment record status
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.payments.update_one(
            {"razorpayOrderId": req.orderId},
            {"$set": {"status": "PAYMENT_SUCCESS", "razorpayPaymentId": req.paymentId}}
        )
    else:
        for p in db_manager.in_memory_store["payments"].values():
            if p["razorpayOrderId"] == req.orderId:
                p["status"] = "PAYMENT_SUCCESS"
                p["razorpayPaymentId"] = req.paymentId

    return {
        "status": "PAYMENT_SUCCESS",
        "orderId": req.orderId,
        "paymentId": req.paymentId,
        "verified": True
    }
