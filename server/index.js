const express = require('express');
let app = express();
let bodyParser = require('body-parser');
let { retrieve, retrieveChar } = require('../database');
let _ = require('lodash');

let port = 5000;

app.listen(port, function () {
  console.log(`listening on port ${port}`);
});

app.use(bodyParser.json());

app.get('/reviews', function (req, res) {
  // console.log(req.query);
  let params = req.query;
  let page = 0;
  let count = 5;
  let sort;
  let product_id = { product_id: 1 };
  if (params.count) {
    count = Number(params.count);
  }
  if (params.sort === 'helpful') {
    sort = 'helpfulness';
  } else if (params.sort === 'newest') {
    sort = 'date';
  } else if (params.params === 'relevant') {
    sort = 'helpfulness';
  }
  if (params.product_id) {
    product_id = { product_id: Number(params.product_id) };
  }
  if (params.page) {
    page = Number(params.page) - 1;
  }

  // console.log(page, count, sort, product_id);
  retrieve(product_id, sort, count, page)
    .then((reviews) => {
      if (reviews.length < 2) {
        throw Error;
      }
      return reviews;
    })
    .then((reviews) => {
      console.log(reviews);
      if (reviews.length < 2) {
        res.status(200).send('No Review for this Product').catch();
      }
      let result = {};
      result.page = reviews[0];
      result.product = reviews[1].product_id;
      result.count = reviews.length;
      let output = [];
      for (let i = 1; i < reviews.length; i++) {
        let tempObj = _.pick(reviews[i], [
          'review_id',
          'rating',
          'summary',
          'recommend',
          'response',
          'body',
          'date',
          'reviewer_name',
          'helpfulness',
          'photos',
        ]);
        output.push(tempObj);
      }
      result.results = output;
      // console.log(result);
      res.status(200).send(result);
    })
    .catch((err) => {
      // console.log('Error:', err);
      res.send('May Be No Product Reviews').status(500);
    });
});

app.get('/reviews/meta', function (req, res) {
  // console.log(req.query);
  let product_id = req.query;
  retrieveChar(product_id)
    .then((meta) => {
      if (meta.length < 1) {
        throw Error;
      }
      return meta;
    })
    .then((meta) => {
      // meta[0].Char;
      let output = [];
      for (let i = 0; i < meta.length; i++) {
        let tempObj = _.pick(meta[i], [
          'product_id',
          'characteristic_id',
          'rating',
          'recommend',
          'Chars',
        ]);
        output.push(tempObj);
      }
      // console.log(output[0].Chars);
      // console.log(output);

      let fit = { id: null, value: 0, count: 0 };
      let length = { id: null, value: 0, count: 0 };
      let comfort = { id: null, value: 0, count: 0 };
      let size = { id: null, value: 0, count: 0 };
      let quality = { id: null, value: 0, count: 0 };
      let width = { id: null, value: 0, count: 0 };
      // console.log('here', output);

      let rates = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      let recom = {
        0: 0,
      };

      for (let i = 0; i < output.length; i++) {
        recom['0'] += output[i].recommend;
        rates[output[i].rating] += 1;
        for (let j = 0; j < output[i].Chars.length; j++) {
          if (output[i].Chars[j].name === 'Fit') {
            fit.name = 'Fit';
            fit.id = output[i].Chars[j].characteristic_id;
            fit.value += output[i].Chars[j].value;
            fit.count += 1;
            // console.log(fit);
          }
          if (output[i].Chars[j].name === 'Length') {
            length.name = 'Length';
            length.id = output[i].Chars[j].characteristic_id;
            length.value += output[i].Chars[j].value;
            length.count += 1;
            // console.log(length);
          }
          if (output[i].Chars[j].name === 'Comfort') {
            comfort.name = 'Comfort';
            comfort.id = output[i].Chars[j].characteristic_id;
            comfort.value += output[i].Chars[j].value;
            comfort.count += 1;
            // console.log(comfort);
          }
          if (output[i].Chars[j].name === 'Size') {
            size.name = 'Size';
            size.id = output[i].Chars[j].characteristic_id;
            size.value += output[i].Chars[j].value;
            size.count += 1;
            // console.log(size);
          }
          if (output[i].Chars[j].name === 'Quality') {
            quality.name = 'Quality';
            quality.id = output[i].Chars[j].characteristic_id;
            quality.value += output[i].Chars[j].value;
            quality.count += 1;
            // console.log(quality);
          }
          if (output[i].Chars[j].name === 'Width') {
            width.name = 'Width';
            width.id = output[i].Chars[j].characteristic_id;
            width.value += output[i].Chars[j].value;
            width.count += 1;
            // console.log(width);
          }
        }
      }
      // console.log(fit);
      // console.log(length);
      // console.log(comfort);
      // console.log(size);
      // console.log(quality);
      // console.log(width);
      // console.log(rates);

      let totals = [];
      totals.push(fit, length, comfort, size, quality, width);

      let characteristics = {};

      for (let n = 0; n < totals.length; n++) {
        if (totals[n].id) {
          characteristics[totals[n].name] = {
            id: totals[n].id,
            value: totals[n].value / totals[n].count,
          };
        }
      }
      // console.log(characteristics);

      let metaData = {
        product_id: output[0].product_id,
        ratings: {},
        characteristics: {},
      };

      metaData.ratings = rates;
      metaData.recommended = recom;
      metaData.characteristics = characteristics;

      console.log(metaData);

      res.status(200).send(metaData);
    })
    .catch((err) => {
      res.send('There May Be No Meta Data').status(500);
    });
});

// app.post('/reviews', function (req, res) {
//   console.log(req.body);
// });
