const express = require('express');
const router = express.Router();

const {
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');

// GET /api/customers - Get all customers with optional search and sort
router.get('/', getCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', getCustomerById);

// PUT /api/customers/:id - Update customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', deleteCustomer);

module.exports = router;