const express = require('express');
const router = express.Router();
const {
  initiateSSLCommerzPayment,
  completeSSLCommerzPayment,
  handleSSLIPN,
  handlePaymentSuccess,
  handlePaymentFailed,
  handlePaymentCancel,
  autoConfirmPayment,
  validatePayment,
  getPayments,
  getPaymentById,
  createInvoice,
  getAllPaymentsAdmin,
  getPaymentStatistics,
  updatePaymentStatus,
  refundPayment,
} = require('../controllers/paymentController');

// 1. SSLCommerz Core Payment Flow
router.post('/sslcommerz/init', initiateSSLCommerzPayment);
router.post('/init', initiateSSLCommerzPayment);
router.post('/sslcommerz/complete', completeSSLCommerzPayment);
router.post('/complete', completeSSLCommerzPayment);

// 2. SSLCommerz Webhook & IPN (handles both POST /ssl-ipn and /sslcommerz/ipn)
router.post('/sslcommerz/ipn', handleSSLIPN);
router.post('/ssl-ipn', handleSSLIPN);
router.post('/ipn', handleSSLIPN);

// 3. SSLCommerz Callbacks (Redirect endpoints - handles both POST and GET)
router.all('/sslcommerz/success', handlePaymentSuccess);
router.all('/success', handlePaymentSuccess);

router.all('/sslcommerz/fail', handlePaymentFailed);
router.all('/sslcommerz/failed', handlePaymentFailed);
router.all('/failed', handlePaymentFailed);
router.all('/fail', handlePaymentFailed);

router.all('/sslcommerz/cancel', handlePaymentCancel);
router.all('/cancel', handlePaymentCancel);

// 4. Verification & Dev Utilities
router.post('/sslcommerz/auto-confirm', autoConfirmPayment);
router.post('/auto-confirm', autoConfirmPayment);
router.get('/sslcommerz/validate/:transactionId', validatePayment);
router.get('/validate/:transactionId', validatePayment);

// 5. Admin & Accounts Management
router.get('/admin/all', getAllPaymentsAdmin);
router.get('/admin/statistics', getPaymentStatistics);
router.put('/admin/status/:id', updatePaymentStatus);
router.post('/admin/refund/:id', refundPayment);

// 6. Student & Resident Invoice Records
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/create-invoice', createInvoice);

module.exports = router;
