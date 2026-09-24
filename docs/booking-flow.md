# Booking & Payment Flow Documentation

## End-to-End Booking Sequence

```
User Selects Offer (Flight / Hotel)
       │
       ▼
Show Booking Summary Modal
       │
       ▼
Redirect to /checkout
       │
       ▼
User Fills Passenger Details & Checks Explicit Human Confirmation Box
       │
       ▼
POST /api/payments/create ──> Razorpay Order Created
       │
       ▼
User Completes Sandbox Checkout
       │
       ▼
POST /api/payments/verify ──> Backend Verifies HMAC SHA256 Signature
       │
       ▼
POST /api/bookings/flight OR /api/bookings/hotel ──> Create Confirmed Booking in MongoDB
       │
       ▼
Redirect to /my-trips ──> Display Booking E-Ticket / Receipt with "TEST BOOKING" Label
```
