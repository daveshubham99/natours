const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../Model/reviewModel');
const handlerFactory = require('./handlerfactory')


exports.setTourAndUserIds = (req, res, next) => {
    if (!req.body.User) req.body.User = req.user.id
    if (!req.body.Tour) req.body.Tour = req.params.tourId
    next();
}
//     if (!req.b
exports.createReview = handlerFactory.craeteOne(Review)
exports.deleteReview = handlerFactory.deleteOne(Review)
exports.updateReview = handlerFactory.updateOne(Review)
exports.getAllReview = handlerFactory.findAll(Review)
exports.findReviewById = handlerFactory.findOne(Review)


////////notes of previous methods

// catchAsync(async (req, res, next) => {
//     if (!req.body.User) req.body.User = req.user.id
//     if (!req.body.Tour) req.body.Tour = req.params.tourId

//     console.log(req.params.tourId, req.body.tour + "this")
//     const review = await Review.create(
//         {
//             review: req.body.review,
//             reviewRating: req.body.reviewRating,
//             Tour: req.body.Tour,
//             User: req.body.User
//         }
//     );
//     res.status(200).json({
//         no: review.length,
//         status: 'success',
//         review
//     })
// })


// old get all reviews
// catchAsync(async (req, res, next) => {
//     let filter = {}
//     if (req.params.tourId) filter = { Tour: req.params.tourId }

//     console.log(filter)
//     const reviews = await Review.find(filter);
//     res.status(200).json({
//         no: reviews.length,
//         status: 'success',
//         reviews
//     })
// })