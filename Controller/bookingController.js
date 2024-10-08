const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_PASSKEY)
const Tour = require('./../Model/tourModel')
const createAsync = require('./../utils/catchAsync')
const Booking = require('../Model/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./../Controller/handlerfactory')
exports.checkoutSession = createAsync(async (req, res, next) => {
    //1) get the tour related to id 
    const tour = await Tour.findById(req.params.tourId)


    //2) create a stripe session 
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?Tour=${req.params.tourId}&User=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: tour.name,
                    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                },
                unit_amount: tour.price * 100,
            },
            quantity: 1,
        }],
        mode: 'payment',

        // name: `${tour.name}tour`,
        // description: `${tour.summary}`,
        // images: [`https://www.natours.dev/img/tours/${tour.imageCover}.jpg`],
        // amount: tour.price * 100,
        // currency: 'INR',
        // quantity: 1


    })


    //3) send the stripe session as a  res
    res.status(200).json({
        status: 'success',
        session
    })

})
exports.bookingCheckout = catchAsync(async (req, res, next) => {
    const { Tour, User, price } = req.query


    if (!Tour && !User && !price) return next();

    await Booking.create({ Tour, User, price })

    res.redirect(req.originalUrl.split('?')[0])


})
exports.getAllBookings = handlerFactory.findAll(Booking)
exports.getBookingById = handlerFactory.findOne(Booking)

