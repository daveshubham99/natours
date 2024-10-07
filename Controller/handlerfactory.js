const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFEATURES = require('../utils/apiFeatures.js');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    console.log('init')
    console.log(req.params.id);
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('There is no document found with requested id', 404));
    }
    res.status(201).json({
        status: 'sucessful',
        message: 'document deleted successfully',
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    // console.log(req.user.id);
    console.log("this is you")
    if (!req.params.id) req.params.id = req.user.id

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    console.log(doc)
    if (!doc) {
        return next(new AppError('There is document tour fond with requested id', 404));
    }
    res.status(201).json({
        status: 'sucessful',
        data: {
            doc,
        },
    });

});

exports.craeteOne = Model => catchAsync(async (req, res, next) => {
    console.log('craeteOne')
    const body = req.body;
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'sucessful',
        data: {
            doc,
        },
    });
})

exports.findAll = Model => catchAsync(async (req, res) => {
    console.log(req.query);

    //this is just a simple hack for cross routing especially with reviews
    let filter = {}
    if (req.params.tourId) filter = { Tour: req.params.tourId }

    const features = new APIFEATURES(Model.find(filter), req.query).fillter().sorting().paginating().limitingFeilds();
    console.log(features);

    const docs = await features.query
    //.explain();

    res.status(200).json({
        status: 'sucess',
        length: docs.length,
        data: {
            docs,
        },
    });
});

exports.findOne = (Model, populate) => catchAsync(async (req, res, next) => {
    console.log("init" + "yhase")

    if (!req.params.id) req.params.id = req.user.id

    let query = Model.findById(req.params.id)

    // if (populate) {
    console.log(populate)
    query = query.populate(populate)
    //}
    console.log(query)
    const doc = await query
    console.log(doc.guides)
    if (!doc) {
        console.log('init')
        return next(new AppError('There is no doc found with requested id', 404));
    }
    res.status(201).json({
        status: 'sucessful',
        data: {
            doc,
        },
    });

});