const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = express();
app.use(express.json());
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerfactory')
const APIFEATURES = require('../utils/apiFeatures.js');
const AppError = require('./../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.feilds = ' name ,description ,ratingsAverage,imageCover,price';
  req.query.sort = '-price,-ratingsAverage'
  next();
}

const multerStorage = multer.memoryStorage();
//multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users/')
//     },
//     filename: (req, file, cb) => {

//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })



// filter checking weather my mim type starts with image or not 
const multerFileFiltter = (req, file, cb) => {
  console.log('filter')
  console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  }
  else {
    cb(new AppError('The uploded file is not a image or file format is not supoorted ', 400))
  }

}



const upload = multer({
  //dest: 'public/img/users/' 
  fileFilter: multerFileFiltter,
  storage: multerStorage

})
exports.uploadTourPhotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
])
exports.resizeTourImages = catchAsync(async (req, res, next) => {

  //1) imageCover
  console.log(req.files.imageCover[0].fieldname)
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`
  sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)
  console.log(req.body.imageCover)

  //2) images
  req.body.images = [];
  console.log("starts")
  console.log(req.files)
  console.log("ends")
  await Promise.all(req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

    await sharp(file.buffer)
      .resize(4000, 2500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`)
    req.body.images.push(filename)
    console.log(req.body.images)

  }));

  next();
})

const Tour = require('../Model/tourModel');
populate = { path: 'reviews', select: '-createdAt -__v -id' }//, 
// Find a tour by id
exports.findTourByID = handlerFactory.findOne(Tour, populate)

//edit a tour by id
exports.editTourByID = handlerFactory.updateOne(Tour)
//DELETETOURBYID
exports.delateTourById = handlerFactory.deleteOne(Tour)
//create a tour 
exports.createTour = handlerFactory.craeteOne(Tour);
//Find all tours
exports.findAllTour = handlerFactory.findAll(Tour);
//find the tours within radius
//radius-within/:distance/center/:lag,long/radius/:radius
exports.getToursWithin = async (req, res, next) => {

  const { distance, langlat, unit } = req.params
  console.log(distance, unit, langlat)
  const [lat, long] = langlat.split(',')
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } } })
  if (!tours) {
    //next(new AppError('no tour found', 404))
    return next(new AppError('no tour found', 404))
  }
  console.log(tours)
  console.log(distance, lat, long, radius)
  res.status(200).json({
    status: 'success',
    length: tours.length,
    tours
  })
}
exports.getDistances = catchAsync(async (req, res, next) => {

  const { latlang, unit } = req.params
  console.log(unit, latlang)
  const [lat, long] = latlang.split(',')
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001
  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
  //const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } } })
  const tours = await Tour.aggregate([
    {
      $geoNear:
      {
        near:
        {
          type: 'point',
          coordinates: [long * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project:
      {
        name: 1,
        distance: 1
      }
    }
  ])

  res.status(201).json({
    status: 'success',
    tours
  })





})

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate(
    [{
      $match: { price: { $gte: 0 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numStats: { $sum: 1 },
        ratingsAverage: { $avg: '$ratingsAverage' }
      }
    }]
  )


  console.log(stats)
  res.status(201).json({
    status: 'sucessful',
    data: {
      stats
    },
  });
})

//search for a plan in certain year
exports.getMontlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  console.log(year);
  const montlyplan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match:
      {
        startDates: {
          $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)

        }
      }

    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },

      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTours: -1 }
    }
  ])

  res.status(201).json({
    status: 'sucessful',
    data: {
      montlyplan
    },
  });
})




////////notes of previous methods

//common error handling


//Create a new tour
// catchAsync(async (req, res, next) => {
//   console.log(req.params.id);
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//   if (!tour) {
//     return next(new AppError('There is no tour fond with requested id', 404));
//   }
//   res.status(201).json({
//     status: 'sucessful',
//     data: {
//       tour,
//     },
//   });



// exports.delateTourById = catchAsync(async (req, res) => {
//   console.log(req.params.id);
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('There is no tour found with requested id', 404));
//   }
//   res.status(201).json({
//     status: 'sucessful',
//     message: 'tour deleted successfully',
//   });
// })

// catchAsync(async (req, res, next) => {
//   const body = req.body;
//   const tour = await Tour.create(req.body);


//   res.status(201).json({
//     status: 'sucessful',
//     data: {
//       tour,
//     },
//   });
// })


//old methpd to find all tours


// catchAsync(async (req, res) => {
//   console.log(req.query);

//   const features = new APIFEATURES(Tour.find(), req.query).fillter().sorting().paginating().limitingFeilds();
//   console.log(features);

//   const tours = await features.query;

//   res.status(200).json({
//     status: 'sucess',
//     length: tours.length,
//     data: {
//       tours,
//     },
//   });
// });




////////find tour by id
// catchAsync(async (req, res, next) => {
//   console.log(req.params.id);
//   console.log(process.env)
//   const tour = await Tour.findById(req.params.id)
//     .populate({
//       path: 'reviews',
//       select: '  -createdAt -__v -id',
//     })

//   if (!tour) {
//     console.log('init')
//     return next(new AppError('There is no tour found with requested id', 404));
//   }
//   res.status(201).json({
//     status: 'sucessful',
//     data: {
//       tour,
//     },
//   });

// });