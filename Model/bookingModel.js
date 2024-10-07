const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({

    Tour: {
        type: mongoose.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must be related to tour only']
    },
    User: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must be related to user only']
    },
    price:
    {
        type: Number,
        required: [true, 'Booking must have price']
    },
    createdAt:
    {
        type: Date,
        default: Date.now()
    },
    paid:
    {
        type: Boolean,
        default: true
    }

})

bookingSchema.pre(/^pre/, function (next) {
    this.populate('User').populate({
        path: 'Tour',
        select: 'name'
    })
})

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;