const { string } = require('i/lib/util');
const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./../Model/userModel')
// const User = require('./userModel')
const tourSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Name must have at least 3 char'],
    maxlength: [60, 'Name must not have less than 60 char']
  },
  duration: {
    type: Number,
    require: true,
    require: [true, 'A tour must have a duration'],
  },
  groupSize: {
    type: Number,
    require: [true, 'A tour must have a groupSize'],
  },
  slug: String,
  difficulty: {
    type: String,
    require: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    require: [true, 'A tour must have a ratingsAverage'],
    min: [0, 'Rating must be above 0.0'],
    max: [5, 'Rating must be below 5.0'],
    default: 5
  },
  reatingQuantity: {
    type: Number,
    require: [true, 'A tour must have reatingQuantity'],
  },
  priceDiscount: {
    type: Number
  },
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  price: {
    type: Number,
    require: true,
  },
  summary: {
    type: String,
    require: [true, 'A tour must have a summary'],
    trim: true
  },
  description: {
    type: String,
    require: [true, 'A tour must have a description'],
    trim: true
  },
  description: {
    type: String,
  },
  ratingsQuantity: {
    type: Number
  },
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  guides: [

    {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }


  ],
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      Day: Number
    }],
  maxGroupSize: {
    type: Number
  },

  secretTour: {
    type: Boolean,
    default: false
  },
  imageCover: {
    type: String,
  },
  images: [String],
  createdDate: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date]

},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }

  });
//////////////////////****************************virtual proerties************************************************////////////////////////////////////

// tourSchema.pre('save', async function (next) {

//   console.log(this.guides[1] + "this is your id")
//   const guide = await User.findById(this.guides[1])
//   console.log(guide)
//   const guidePromises = this.guides.map(id => User.findById(id))
//   this.guides = await Promise.all(guidePromises);
//   console.log(this.guides);
//   next();
// })
///property which is userd in query a lot should be added in index of database so as to avoid long check

tourSchema.index({ price: -1 })
tourSchema.index({ startLocation: '2dsphere' })



//virtually populating the feild in tour results only when displaying it for single tour  
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'Tour',
  localField: '_id'

})

tourSchema.virtual('durationweek').get(function () {
  return this.duration / 7;
});
////////////////////****************************Document middleware************************************************////////////////////////////////////
tourSchema.pre('save', function (next) {

  this.slug = slugify(this.name, { lower: true })
  console.log(this)
  next();
}
)
tourSchema.pre(/^find/, function (next) {
  console.log("init+populate")
  this.populate({
    path: 'guides',
    select: '-no '
  })
  next();
})
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// })

////////////////////****************************query middleware************************************************////////////////////////////////////
tourSchema.pre(/^find/, function (next) {

  this.find({ secretTour: { $ne: true } })
  this.start = Date.now();
  next();
})

tourSchema.post(/^find/, function (doc, next) {
  console.log("time taken to query " + (Date.now() - this.start));
  next();
})
////////////////////****************************aggeregate middleware************************************************////////////////////////////////////
// tourSchema.pre('aggregate', function (next) {

//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//   next();
// })



//model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
