const express = require('express');
const bookingController = require('./../Controller/bookingController');
const router = express.Router()
const authController = require('./../Controller/authController');


router.get('/checkoutSession/:tourId', authController.protect, bookingController.checkoutSession)
router.route('/').get(bookingController.getAllBookings)
router.route('/:id').get(bookingController.getBookingById)

module.exports = router;