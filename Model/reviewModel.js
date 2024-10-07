//review // rating //createdAt //ref to tour //ref to user 
const mongoose = require('mongoose');
const { editTourByID } = require('../Controller/tourController');
const Tour = require('./../Model/tourModel')


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Please enter a review ']
    },
    reviewRating: {
        type: Number,
        required: [true, 'Please enter tour rating ']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    Tour: {
        type: mongoose.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Please enter the tour name that you want to review']
    },
    User:
    {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please login to review a tour']

    }


},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })

reviewSchema.index({ Tour: 1, User: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
    this.populate(
        {
            //         path: 'Tour',
            //         select: 'name '
            //     }
            // ).populate({
            path: 'User',
            select: 'name photo'
        })
    next();

})

reviewSchema.statics.calcAverageRating = async function (tourID) {

    const stats = await this.aggregate([
        {
            $match: { Tour: tourID }
        }
        ,
        {
            $group: {
                _id: '$Tour',
                ratingNo: { $sum: 1 },
                rating: { $avg: '$reviewRating' }
            }

        }
    ])
    console.log("youre using this method")
    console.log(stats)
    let update;
    if (stats) {

        update = { ratingsAverage: stats[0].rating, ratingsQuantity: stats[0].ratingNo }
    } else {
        update = { ratingAverage: 4.5, ratingQuantity: 0 }

        console.log(stats)
    }
    await Tour.findByIdAndUpdate(tourID, update)
}

reviewSchema.post('save', function (next) {
    this.constructor.calcAverageRating(this.Tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {

    this.r = await this.findOne()
    console.log('magic starts here')
    console.log(this.r)

    next();


})
reviewSchema.post(/^findOneAnd/, async function () {
    // this.r = await this.findOne()
    console.log(this.r.Tour + "  hh")

    await this.r.constructor.calcAverageRating(this.r.Tour);
})




const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;