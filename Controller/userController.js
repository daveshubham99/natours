const { Mongoose } = require('mongoose');
const User = require('./../Model/userModel');
const Tour = require('./../Model/tourModel');
const catchAsync = require('./../utils/catchAsync');
const { ObjectId } = require('mongodb');
const handlerFactory = require('./handlerfactory')
const AppError = require('./../utils/AppError')
const multer = require('multer');
const sharp = require('sharp');



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

exports.uplodingUserPhoto = upload.single('photo')
exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    console.log('resize')
    
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next();

})






const fillterObj = (obj, ...reqFeilds) => {
    console.log(reqFeilds)
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (reqFeilds.includes(el)) {
            newObj[el] = obj[el];
        }
        console.log(newObj)

    });
    return newObj;
}

//you can not update password with this method so please do not try that 
exports.updateUser = handlerFactory.updateOne(User) // Admistation Purpose
exports.deleteUserByID = handlerFactory.deleteOne(User)
exports.findAllUsers = handlerFactory.findAll(User)
exports.getME = handlerFactory.findOne(User)
exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate('reviews')
    res.status(200).json({
        status: "success",
        user
    })
})

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log("updateMe")
    console.log(req.body)
    console.log(req.file)
    if (req.body.password) {
        next(new AppError('you can not update password from this link', 404))
    }

    const filtterBody = fillterObj(req.body, 'name', 'email')
    filtterBody.photo = req.file.filename

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filtterBody, { new: true, runValidators: true });

    res.status(201).json({
        status: 'success',
        data:
            updatedUser
    })
})

//calling the universal factory handler method to delete



//old method to delete the user 
// exports.deleteME = catchAsync(async (req, res, next) => {
//     console.log(req.user.id)
//     await User.findByIdAndUpdate(req.user.id, { active: false })
//     res.status(204).json({
//         status: "success",
//         data: null
//     })

// })



//old method to find all users
// catchAsync(async (req, res, next) => {
//     console.log(req.query);
//     const users = await User.find(req.query);

//     res.status(200).json({
//         status: 'sucess',
//         length: users.length,
//         data: {
//             users,
//         },
//     });
// });



//multer.diskStorage({

//     destination: (req, file, cb) => {
//         console.log("here")
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         console.log("multer")
//         console.log(req.file)
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })



//****************//****************//****************//****************//****************//**************** */
//const multerStorage = multer.memoryStorage();
// const multerFilter = (req, res, cb) => {
//     console.log("multer filter")
//     if (req.file.mimtype.startswith('image')) {
//         cb(null, true)
//     }
//     else {
//         cb(new AppError('The uploded file is not image ! Please upload a image ', 400), false)
//     }
// }
// const upload = multer({
//     // dest: 'public/img/users'
//     // storage: multerStorage,
//     fielFilter: multerFilter
// })
// exports.resizeUserPhoto = (req, res, next) => {
//     if (!req.file) return next();

//     req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
//     sharp(req.file.buffer)
//         .resize(500, 500)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`public/img/users/${req.file.filename}`)
//     next();

// }


//exports.uploadUserPhoto = upload.single('photo')



//UPDATE ME CHANGES
//if (req.file) filtterBody.photo = req.file.filename