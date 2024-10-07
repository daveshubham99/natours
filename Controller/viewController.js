const Tour = require('./../Model/tourModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/AppError')
const User = require('./../Model/userModel')
const Booking = require('../Model/bookingModel')

exports.overview = catchAsync(async (req, res, next) => {

  const tours = await Tour.find()
  res.status(200).render('overview', {
    title: 'ALL TOURS',
    tours
  })
})



exports.tour = catchAsync(async (req, res, next) => {

  const tour = await Tour.findOne({ name: req.params.name }).populate({
    path: 'reviews',
    select: 'review reviewRating user'
  });
  if (!tour) {
    console.log('here')
    return next(new AppError('No tour found with this name', 404));
  }

  console.log("we are now printing guide");
  console.log(tour.id)
  console.log(tour.guides)
  console.log(tour.reviews)
  res.status(200).render('tour', {
    title: tour.name,
    tour
  })
})


exports.getBookedTours = catchAsync(async (req, res, next) => {

  console.log(req.user)
  const bookings = await Booking.find({ User: req.user.id })

  const tourID = bookings.map(el => el.Tour)
  const tours = await Tour.find({ _id: { $in: tourID } })
  console.log(tours)
  res.status(200).render('overview', {
    titile: 'MY BOOKINGS',
    tours
  })

})
exports.getloginForm = (req, res) => {

  console.log('you will be now rendered to login page')
  res.status(200).render('login',
    {
      title: 'Login page'
    }
  )
};

exports.accoutPage = (req, res) => {
  console.log('init account page')
  res.status(200).render('account', {

    title: 'Account page'

  })

}
exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, { name: req.body.name, email: req.body.email }, { new: true, runValidators: true });
  console.log(updatedUser, 'in nodejs')
  res.status(200).render('account', {

    status: 'success',
    title: 'Account page',
    user: updatedUser

  })
})