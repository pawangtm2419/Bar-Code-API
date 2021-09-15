var createError = require('http-errors');
var express = require('express');
var multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var javascriptBarcodeReader = require('javascript-barcode-reader');

const cors = require('cors'); 
const app = express();
app.use(cors());

var indexRouter = require('./routes/index');

const storage = multer.diskStorage({
  destination: "./upload",
  filename: (req, file, cb) => {
    return cb(null, `BarCode_${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({
  storage: storage
})


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/barCode', upload.single('image_url'), (req, res) => {
  console.log(req.body);
  javascriptBarcodeReader({
    //image: `http://localhost:3000/upload/${req.file.filename}`,
    image: req.body.image_url,
    //barcode: 'Code-128',
    // barcodeType: 'industrial',
    options: {    
      // useAdaptiveThreshold: true
      // singlePass: true
    }
  })
    .then(code => {
      res.json({
        status: true,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        code: code,
        image_url: `http://localhost:3000/upload/${req.file.filename}`
      })
    })
    .catch(err => {
      res.json({
        error: err,
        status: false,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        //image_url: `http://localhost:3000/upload/${req.file.filename}`
      })
    })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
