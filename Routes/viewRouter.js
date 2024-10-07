const express = require('express')
router = express.Router();
const viewController = require('./../Controller/viewController')
const authController = require('./../Controller/authController')
const bookingController = require('./../Controller/bookingController')



router.get('/', bookingController.bookingCheckout, authController.isLoggedIn, viewController.overview)
router.get('/tour/:name', authController.isLoggedIn, viewController.tour)
router.get('/login', viewController.getloginForm)
router.get('/me', authController.protect, viewController.accoutPage)
router.get('/my-tour', authController.protect, viewController.getBookedTours)

router.post('/submit-user-data', authController.protect, viewController.updateUserData)

module.exports = router; 