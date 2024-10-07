//require modules
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const Tour = require('../../Model/tourModel');
const User = require('../../Model/userModel');
const Review = require('../../Model/reviewModel');
const fs = require('fs');

const tour = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'));
const review = JSON.parse(fs.readFileSync('./dev-data/data/reviews.json', 'utf-8'));
const user = JSON.parse(fs.readFileSync('./dev-data/data/users.json', 'utf-8'));
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
    console.log('connected to databse');
  });

const importdata = async () => {
  await Tour.create(tour);
  await User.create(user, { validateBeforeSave: false });
  await Review.create(review, { validateBeforeSave: false });
  console.log('overwrite data successful');
  process.exit();
};

const deletedata = async () => {
  await Tour.deleteMany(Tour);
  await Review.deleteMany(Review);
  await User.deleteMany(User);
  process.exit();
}
if (process.argv[2] === '--imports') {
  console.log('init');
  importdata();
} else if (process.argv[2] === '--delete') {
  console.log('delete');
  deletedata();
}

console.log(process.argv);
