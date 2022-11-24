const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const userRouter = require('./routes/user');
const followerRouter = require('./routes/follow');
const likeRouter = require('./routes/like');
const postRouter = require('./routes/post');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dbLib = require('./db/dbFunction');

const app = express()

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', userRouter);
app.use('/api', followerRouter);
app.use('/api', likeRouter);
app.use('/api', postRouter);

// catch 404 and forward to errors handler
app.use(function (req, res, next) {
  next(createError(404));
});

// errors handler
app.use((err, req, res, next) => {
  // set locals, only providing errors in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the errors page
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
