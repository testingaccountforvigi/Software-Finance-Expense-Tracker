const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.put('/profile', authenticate, userController.updateProfile);
router.get('/payment-methods', authenticate, userController.getPaymentMethods);

module.exports = router;
