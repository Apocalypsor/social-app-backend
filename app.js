const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dbLib = require('./db/dbFunction');

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/api', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
      success: false,
      message: err.message
  });
});

// docs
// const swaggerDefinition = {
//     openapi: '3.0.0',
//     info: {
//         title: 'Toktik API',
//         version: '0.0.1',
//     },
// };
//
// const options = {
//     swaggerDefinition,
//     apis: ['./routes/*.js'],
// };

// const swaggerSpec = swaggerJSDoc(options);
// app.use('/api/docs', swaggerUi.serve)
// app.get('/api/docs', swaggerUi.setup(swaggerSpec))

// connect to db
dbLib.connect().then(() => {
    console.log('connected to db');
});

module.exports = app;
