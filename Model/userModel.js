const bcrypt = require('bcryptjs/dist/bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name:
    {
        type: 'string',
        required: [true, 'Autentication requires name']
    },
    email:
    {
        type: 'string',
        required: [true, 'Autentication requires email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password:
    {
        type: 'string',
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    photo: String,
    role:
    {
        type: 'string',
        required: [true, 'Please enter a role'],
        enum: {
            values: ['admin', 'guide', 'lead-guide', 'user'],
            message: 'Roles can only be admin,guide,lead-guide,user'
        },

    },
    confirmPassword:
    {
        type: 'string',
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'passwords do not match'

        }
    },
    passwordChangeDate: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        select: false,
        default: true
    }


},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


userSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'User',
    localField: '_id'
})

userSchema.pre('save', async function (next) {

    //only works when the password is 
    if (!this.isModified('password')) return next();

    //hash the password with the cost pof 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete the confirmPassword field
    this.confirmPassword = undefined;
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, correctPassword) {


    return await bcrypt.compare(candidatePassword, correctPassword);

}
userSchema.pre(/^find/, function (next) {

    this.find({ active: { $ne: false } })

    next();
})
userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangeDate) {
        const changedTimeStamp = parseInt(this.passwordChangeDate.getTime() / 1000, 10);
        console.log(changedTimeStamp, JWTTimestamp);
        const token = JWTTimestamp < changedTimeStamp

        return token;
    }

    return false;
}
userSchema.methods.createPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 1000 * 60;
    return resetToken
}
const User = mongoose.model('User', userSchema);

module.exports = User;