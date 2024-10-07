const User = require('./../Model/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const { promisify } = require('util');
const Email = require('../utils/email');
const crypto = require('crypto');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}



const sendResWithToken = (user, statusCode, res) => {

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV = 'production') cookieOptions.secure = true;

    user.password = undefined;
    const token = signToken(user._id);
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: "success",
        token,
        user
    })
}
// user will sign up with tjhis method
exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create(
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            passwordChangeDate: req.body.passwordChangeDate,
            role: req.body.role,
            photo: req.body.photo
        });
    url = `${req.protocol}://${req.hostname}/me`
    await new Email(newUser, url).sendWelcome();
    const token = sendResWithToken(newUser, 201, res)
});

//user will login through this method
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password, "login in auth controller");
    if (!email || !password) {
        return next(new AppError('Please enter email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError(`Please enter a correct email or password - ${email},${password}`, 401));
    }

    sendResWithToken(user, 201, res)
})

//logging user out
exports.logout = catchAsync(async (req, res) => {

    console.log("logging out in auth controller");

    res.cookie('jwt', 'logged out', ({
        expiresIn: (Date.now() + 10 * 1000),
        httpOnly: true

    }))

    res.status(200).json({ message: 'success' })
})
//req.headers.authorization &&
exports.protect = catchAsync(async (req, res, next) => {
    console.log('you will logged in soon')
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
        console.log(token)
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // if (token === 'null' || token === null) {
    //     return next(new AppError('You are not logged in, Please login youre account to get access', 401))
    // }
    if (!token) {
        return next(new AppError('You are not logged in, Please login youre account to get access', 401))
    }
    // 2). verify the token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
    console.log(decode)
    //3). check if user still exists
    const currentUser = await User.findById(decode.id)
    if (!currentUser) {
        return next(new AppError('User belonging to the token does not exist', 401))
    }
    //4). check if user cahnged password after the token was issued 

    if (await currentUser.changedPasswordAfter(decode.iat)) {
        return next(new AppError('Please login again as password has been changed'));
    }
    console.log('currentUser', currentUser);
    req.user = currentUser;
    res.locals.user = currentUser;

    //grant access to the route
    next();


});

exports.isLoggedIn = async (req, res, next) => {
    console.log('your authorization is verifing')

    if (req.cookies.jwt) {
        try {
            let token;
            token = req.cookies.jwt;

            // if (token === 'null' || token === null) {
            //     return next(new AppError('You are not logged in, Please login youre account to get access', 401))
            // }

            // 2). verify the token
            const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
            console.log(decode)
            //3). check if user still exists
            const currentUser = await User.findById(decode.id)
            if (!currentUser) {
                return next()
            }
            //4). check if user cahnged password after the token was issued 

            if (await currentUser.changedPasswordAfter(decode.iat)) {
                return next()
            }
            console.log(currentUser)
            res.locals.user = currentUser;
            //grant access to the route
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(roles, req.user.role)
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You are not authorized to perform this action', 401))
        }
        next();
    }
}

exports.forgotPassword = async (req, res, next) => {
    //1.) Get the user based on email 
    console.log(req.body.email)
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('There is no user found with this email kindly check your email', 404))
    }
    //2.)create a randon encypted token 
    const resetToken = await user.createPasswordToken();
    await user.save({ validateBeforeSave: false });
    //3.)send a email with reset link
    reseturl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`
    console.log(reseturl)

    try {
        // await sentEmail({
        //     email: user.email,
        //     subject: 'password reset link',
        //     message
        // })
        await new Email(user, reseturl).sendPasswordResetEmail();
        res.status(200).json({
            status: 'success',
            message: 'Your password reset link sent to eamil'
        })
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('soory! error sending email', 500))
    }

}

exports.resetPassword = async (req, res, next) => {


    // check if the user exist with the token and token is valid

    const resetToken = req.params.resettoken;
    console.log(req.params.resettoken)
    const hasedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hasedToken,
        passwordResetTokenExpires: { $gt: Date.now() }
    })

    //check if the user wioth certain validation still exists
    if (!user) {
        return next(new AppError('user is not found or either the token has been expired ', 404))
    }

    //set the new pass and save it to the data base 
    user.password = req.body.password,
        user.confirmPassword = req.body.confirmPassword,
        passwordResetToken = undefined;
    passwordResetTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });
    console.log(user)
    //create a jwt token 
    sendResWithToken(user, 201, res)
}
exports.updatePassword = async (req, res, next) => {
    console.log(req.user.name)
    //Get the user from the collection
    const user = await User.findOne({ email: req.user.email }).select('+password')

    //check if posted current password is correct 
    console.log(user.password, req.body.password, req.body.newPassword, req.body.confirmNewPassword)
    const checkpass = await user.correctPassword(req.body.password, user.password)
    if (!checkpass) {
        return next(new AppError('the password you entered is incorrect', 404))
    }
    //if so update the password
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmNewPassword;
    await user.save({ validateBeforeSave: false })

    //login user and send jwt
    sendResWithToken(user, 200, res)
}
exports.basicauth = (req, res, next) => {

    res.set('WWW-Authenticate', 'Basic realm="user_pages"');
    res.status(401).send('Authentication required')
}