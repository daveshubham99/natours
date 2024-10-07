const express = require('express');
const router = express.Router();
const authController = require('./../Controller/authController');
const userController = require('./../Controller/userController');
const reviewRoutes = require('./reviewRoutes');





router.get('/me', authController.protect, userController.getME);
router.use('/reviews', reviewRoutes)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/updateMe', authController.protect, userController.uplodingUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.get('/basicauth', authController.basicauth);
router.post('/resetPassword/:resettoken', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.route('/').get(authController.protect, userController.findAllUsers);
//depreciated//router.route('/deleteMe').delete(authController.protect, userController.deleteME);
router.route('/:id').get(userController.getUserById);
router.route('/:id').delete(authController.protect, authController.restrictTo('admin'), userController.deleteUserByID);
router.patch('/updateUsers', authController.protect, authController.restrictTo('admin'), userController.updateUser);



module.exports = router;


//authController.protect,
//tonystark@gmail.coms
//userController.uploadUserPhoto, userController.resizeUserPhoto,