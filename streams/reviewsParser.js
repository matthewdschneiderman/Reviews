const http = require('http');
const parse = require('csv-parser');
const fs = require('fs');
const { Transform } = require('stream');
var csvWriter = require('csv-write-stream');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// const parser = parse({ columns: true }, function (err, records) {
//   console.log(records);
// });

const recomConvert = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    // console.log('info', chunk);
    if (chunk.recommend === '0' || chunk.recommend === '1') {
      chunk.recommend = Number(chunk.recommend);
    } else if (chunk.recommend.toLowerCase() === 'true') {
      chunk.recommend = 1;
    } else if (chunk.recommend.toLowerCase() === 'false') {
      chunk.recommend = 0;
    }
    this.push(chunk);
    callback();
  },
});

const reportConvert = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    // console.log('info', chunk);
    if (chunk.reported === '0' || chunk.reported === '1') {
      chunk.reported = Number(chunk.reported);
    } else if (chunk.reported.toLowerCase() === 'true') {
      chunk.reported = 1;
    } else if (chunk.reported.toLowerCase() === 'false') {
      chunk.reported = 0;
    }
    this.push(chunk);
    callback();
  },
});

const intConvert = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    chunk.id = Number(chunk.id);
    chunk.product_id = Number(chunk.product_id);
    chunk.helpfulness = Number(chunk.helpfulness);
    this.push(chunk);
    callback();
  },
});

const nullConvert = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    if (chunk.response === 'null' || chunk.response === '') {
      chunk.response = '';
    }
    this.push(chunk);
    callback();
  },
});

// let results = [];

let readStream = fs.createReadStream(
  '/Users/matthewschneiderman/Downloads/reviews.csv'
);

let writeStream = fs.createWriteStream(
  '/Users/matthewschneiderman/Desktop/reviews.csv'
);

let writer = csvWriter();

writer.pipe(writeStream);
readStream
  .pipe(
    parse({ columns: true }, function (err, records) {
      console.log(records);
    })
  )
  .pipe(recomConvert)
  .pipe(reportConvert)
  .pipe(intConvert)
  .pipe(nullConvert)
  .on('data', (row) => {
    writer.write(row);
  })
  .on('end', () => {
    console.log('success');
    writer.end();
  });
