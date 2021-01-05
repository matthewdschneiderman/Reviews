const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

// console.log('here', process.env.MONGO_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MongoDB running');
});

let reviewSchema = new mongoose.Schema({
  product_id: Number,
  review_id: { type: Number, unique: true },
  rating: Number,
  summary: String,
  recommend: Number,
  response: String,
  body: String,
  date: String,
  reviewer_name: String,
  helpfulness: Number,
  photos: [
    {
      id: Number,
      url: String,
    },
  ],
  Chars: [
    {
      name: String,
      characteristic_id: Number,
      value: Number,
    },
  ],
});

let Review = mongoose.model('reviews', reviewSchema, 'completedETL');

let retrieve = async (product_id, sort, count, page) => {
  let result = await Review.find(product_id)
    .sort(`-${sort}`)
    .skip(page * count)
    .limit(count)
    .exec();

  result.unshift(page + 1);
  return result;
};

let retrieveChar = (product_id) => {
  return Review.find(product_id).exec();
};

module.exports = { retrieve, retrieveChar };
