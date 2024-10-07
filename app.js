//require modules
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const reviewRoutes= require('./Routes/reviewRoutes')
process.on('uncaughtException',err =>
  {
    console.log('Closing App due to some unwanted issue');
    console.log(err.name, err.message);
        process.exit(1);

  });
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const app = express();
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./Controller/errorController');
const tourRoutes = require('./Routes/tourRouter');
const userRoutes = require('./Routes/userRoutes');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const { default: helmet } = require('helmet');
const viewRouter = require('./Routes/viewRouter')
const hpp = require('hpp')
const compression = require('compression')
const bookingRoutes = require('./Routes/bookingRoutes')
//variable
const db = process.env.dataBase;
PORT = process.env.PORT;
//connect mongoose
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('connected to database');
  });

//defining my pug template with giving it a rendering path
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))


//defining my public file ref
app.use(express.static(path.join(__dirname, 'public')))


//content security policy 

//defining the path 

//prevent parameter pollution
app.use(hpp(
  {
    whitelist:['duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price']
  }
))

//middle ware
//adds certain feilds to http header for the purpose of security
app.use(helmet());
app.user(compression());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src *; img-src * data:; script-src *; style-src *");
  next();
});
// app.use(
//   helmet.contentSecurityPolicy({
//     defaultSrc: ["'self'", 'data:', 'blob:'],
//       fontSrc: ["'self'", 'https:', 'data:'], // Allow external fonts
//       scriptSrc: ["'self'", 'https://js.stripe.com', 'https://api.mapbox.com', 'https://cdnjs.cloudflare.com', "'unsafe-inline'"], // Allow Stripe, Mapbox, and Axios
//       scriptSrcElem: ["'self'", 'https://cdnjs.cloudflare.com', 'https://js.stripe.com', 'https://api.mapbox.com'], // Specifically for external script elements
//       styleSrc: ["'self'", 'https:', "'unsafe-inline'"], // Allow inline styles (consider using nonces/hashes later)
//       connectSrc: ["'self'", 'ws:', 'wss:', 'https://*.cloudflare.com', 'https://api.mapbox.com', 'data:'], // Allow WebSocket and external connections
//       imgSrc: ["'self'", 'data:'], // Allow images from the same origin and data URIs
//       frameSrc: ["'self'", 'https://js.stripe.com'], // Allow Stripe frames
//       objectSrc: ["'none'"] // Block <object> elements
//   })
// );
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
      "default-src 'self' data: blob; " +
      "script-src 'self' https://js.stripe.com https://cdnjs.cloudflare.com; " +
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: *; " +
      "connect-src 'self' ws://*; " +
      "frame-src 'self' https://js.stripe.com; " +
      "child-src 'self' https://js.stripe.com;"
  );
  next();
});

// body parser it parses the body into req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({ extended:true ,limit:'10kb'}));
app.use(cookieParser())

//data sanitization aginst noSql query injection
app.use(mongoSanitize());

//data sanitization aginst xss
app.use(xss())

// used to test some middleware
app.use((req,res,next)=>
{
    req.requestTime =new Date().toISOString;
    next();
})

//use to limit req on server
const limiter = rateLimit ({
  max:100,
  windowMs:60*60*1000,
  message:'you have crossed your request limit'
})
app.use('/api',limiter)

app.use('/api/v1/reviews', reviewRoutes)
app.use('/',viewRouter)
  
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.use('/api/v1/users',userRoutes); 

// app.all('*',(req,res,next) => {
//   next(new AppError(`the requested url ${req.originalUrl} is not available on this server`,500));
//   });
app.use(globalErrorHandler);

//server
const server = app.listen(PORT, () => {
  console.log('Connection Successful');
});

// handling unhandled rejections 

process.on('unhandledRejection',err =>
{
  console.log('Closing App due to some unwanted issue');
  console.log(err.name, err.message,err.stack);
  server.close(()=>
    {
      process.exit(1);
    });
});



//  app.all('*', (req, res, next) => {
  
 // next(new AppError(`the url you requested ${req.originalUrl} not found on this server`, 404));

  // *******************************root code*********************************************************************************************************************************************************************************************************************  
              // res.status(404).json(
              //   {
              //     status: '404 Not Found',
              //     message: `the url you requested ${req.originalUrl} not found on this server`
              //   }
              // )
              // const err = new Error(`the url you requested ${req.originalUrl} not found on this server`);
              // err.statusCode = 404;
              // err.satuts = 'fail';
              // next(err);
 // });
  
// mangoose schema

//create a object
// const tour = new Tour({
//   name: 'manali',
//   price: 2000,
//   description: 'Beautiful place with natural view and amazing hospitality',
// });

// tour
//   .save()
//   .then((doc) => {
//     console.log('document is saved');
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });
//route
//middleware
//set security
//used to test some middleware  
  