const express = require('express');
const router = express.Router();
const {
  initiateSSLCommerzPayment,
  completeSSLCommerzPayment,
  getPayments,
  getPaymentById,
  createInvoice,
} = require('../controllers/paymentController');

// SSLCommerz payment endpoints
router.post('/sslcommerz/init', initiateSSLCommerzPayment);
router.post('/sslcommerz/complete', completeSSLCommerzPayment);

// Payment records & invoice management
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/create-invoice', createInvoice);

module.exports = router;
