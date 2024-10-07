//require modules
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = express();
app.use(express.json());
const mongoose = require('mongoose');
const User = require('../../Model/userModel');
const fs = require('fs');

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
  await User.create(user);
  console.log('overwrite data successful');
  process.exit();
};

const deletedata = async () => {
  await User.deleteMany(User, { runValidators: false });
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

