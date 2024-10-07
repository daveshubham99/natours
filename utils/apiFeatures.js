
const Tour = require('../Model/tourModel');

class APIFEATURES {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  fillter() {
    const queryobj = { ...this.queryString }
    const excludedFeilds = ['feilds', 'limit', 'sort', 'page'];
    excludedFeilds.forEach(el => delete queryobj[el]);
    let queryStr = JSON.stringify(queryobj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    }
    else {
      this.query = this.query.sort('-createdDate')
    }
    return this;
  }
  limitingFeilds() {
    if (this.queryString.feilds) {
      const feilds = this.queryString.feilds.split(',').join(' ');
      this.query = this.query.select(feilds)
    }
    else {
      this.query = this.query.select('-__v')
    } return this;
  }
  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    if (this.queryString.page) {
      const numTours = Tour.countDocuments();
      if (skip >= numTours) throw new Error("Requested page does not exist pages are limited to " + numTours / limit);
    }
    return this;
  }
}
module.exports = APIFEATURES;