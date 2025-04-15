
const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/confirm', paymentController.confirmPayment);

module.exports = router;
