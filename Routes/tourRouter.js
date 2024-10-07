const express = require('express');
const router = express.Router();
const tourController = require('../Controller/tourController');
const authController = require('./../Controller/authController')
const reviewController = require('./../Controller/reviewController')
const reviewRoutes = require('./reviewRoutes')


// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/reviews', reviewRoutes)

router
  .route('/getstats').get(tourController.getTourStats)
router
  .route('/getmontlyplan/:year').get(tourController.getMontlyPlan)
router
  .route('/5-cheap-tour')
  .get(tourController.aliasTopTours, tourController.findAllTour);
router
  .route('/')
  .get(authController.protect, tourController.findAllTour)
  .post(tourController.createTour);
router
  .route('/:id').get(tourController.findTourByID)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourPhotos, tourController.resizeTourImages, tourController.editTourByID)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.delateTourById);
//radius-within/:distance/center/:lag,long/radius/:radius

router.route('/tours-within/:distance/center/:langlat/unit/:unit').get(tourController.getToursWithin)
router.route('/distance/center/:latlang/unit/:unit').get(tourController.getDistances)
///distance/latlang/33.90, -118.41/unit/mi
module.exports = router;
