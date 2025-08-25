const express = require('express');
const router = express.Router();
const { createMomoPayment, momoIPN, createStripePaymentIntent } = require('../controllers/payController');

// Tạo giao dịch MoMo (trả về payUrl để mở)
router.post('/momo/create', createMomoPayment);
// IPN (tuỳ, dev local có thể chưa dùng)
router.post('/momo/ipn', momoIPN);

// Stripe: tạo PaymentIntent (Visa)
router.post('/stripe/create-intent', createStripePaymentIntent);

module.exports = router;
