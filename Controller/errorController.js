const AppError = require('../utils/AppError');
const handleCastErrorDB = (err) => {
    const message = `invalid ${err.path}:${err.value}`
    console.error(message, err.stack)
    return (new AppError(message, 400))
} ///(["])(?:.)*\1/
const handleDuplicateErrorDB = (err) => {
    const value = err.errmsg.match(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/)
    console.log(value)
    message = `the value you entered already exist ${value}hence enter right value`
    return (new AppError(message, 400))
}
const handleValidationErrorDB = (err) => {
    console.log('Invalid Input Data')
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input Data - ${errors.join('. ')}`
    return (new AppError(message, 400))
}

const handleJWTErroe = err => {
    return (new AppError('Youre not logged in please login', 401));
}

const sendProductionerrr = (err, req, res) => {
    // if there is operational error we can send it to client 
    console.log("im in error production")
    if (req.originalUrl.startsWith('/api')) {

        if (err.isOperational) {
            this.statusCode = err.statusCode || 500;
            this.status = err.status || 'error';
            console.log(err, err.message, err.stack);
            res.status(this.statusCode).json({
                status: this.status,
                message: err.message
            });
        }
        //but programming error ot any other error shouldnt be sent to client 
        else {

            //1) log error
            this.statusCode = err.statusCode || 500;
            this.status = err.status || 'error';

            //2) send genric error message
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong',
                stack: err
            });
        }
    }
    else {
        console.log("not in piug")
        if (err.isOperational) {
            console.log('i was here')
            this.statusCode = err.statusCode || 500;
            this.status = err.status || 'error';
            console.log(err, err.message, err.stack);
            res.status(this.statusCode).render('error',
                {
                    title: 'Rendering Error',
                    msg: err.message
                }
            )
        }
        else {
            console.log("im here too")
            //1) log error
            this.statusCode = err.statusCode || 500;
            this.status = err.status || 'error';
            console.log(err.message);
            //2) send genric error message
            res.status(this.statusCode).render('error',
                {
                    title: 'Rendering Error',
                    msg: err.message,
                }
            )
        };

    }

}

const sendDevelopmenterrr = (err, req, res) => {

    if (req.originalUrl.startsWith('/api')) {
        this.statusCode = err.statusCode || 500;
        this.status = err.status || 'error';
        console.log(err);
        console.log(err.message);
        res.status(this.statusCode).json({
            status: this.status,
            message: err.message,
            err: err,
            stack: err.stack
        });
    }

    else {
        res.status(err.statusCode).render('error',
            {
                title: 'Rendering Error',
                msg: err.message
            }
        )
    }
}
module.exports = (err, req, res, next) => {
    console.log("Youre handling your error ")
    console.log(process.env.NODE_ENV)


    ///checking your working mode development or production



    //if production
    if (process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message, name: err.name, stack: err.stack, errmsg: err.message, errors: err.errors };
        console.log(error.name);
        if (error.name === 'CastError') { error = handleCastErrorDB(error); }
        if (error.code === 11000) { error = handleDuplicateErrorDB(error); }
        if (error.name === 'ValidationError') { error = handleValidationErrorDB(error); }
        if (error.name === 'JsonWebTokenError') { error = handleJWTErroe(error); }
        sendProductionerrr(error, req, res);
    }




    // if developmennt
    if (process.env.NODE_ENV === 'development') {
        console.log(req.originalUrl);
        sendDevelopmenterrr(err, req, res);
    }
    // this.statusCode = err.statusCode || 500;
    // this.status = err.status || 'error';
    // res.status(this.statusCode).json({
    //     status: this.status,
    //     message: err.message
    // });
}