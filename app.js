const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const followerRouter = require('./routes/follow');
const likeRouter = require('./routes/like');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');

const dbLib = require('./db/dbFunction');

const app = express()

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/follow', followerRouter);
app.use('/api/like', likeRouter);
app.use('/api/post', postRouter);
app.use('/api/comment', commentRouter);

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

// connect to db
dbLib.connect().then(() => {
    console.log('connected to db');
});

module.exports = app;
