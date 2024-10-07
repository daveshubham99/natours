const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('./../Controller/reviewController');
const authController = require('./../Controller/authController');


router.use(authController.protect)
router.get('/', authController.restrictTo('user'), reviewController.getAllReview).post('/', reviewController.setTourAndUserIds, reviewController.createReview)
//delete review by id
router.delete('/:id', authController.restrictTo('user', 'admin'), reviewController.deleteReview)

//update a review with a id
router.patch('/:id', authController.restrictTo('user', 'admin'), reviewController.updateReview).get('/:id', reviewController.findReviewById)



// post /tour/tourId/rewies

//get /users/:user/user


module.exports = router;