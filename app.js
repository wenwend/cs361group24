var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const { Client } = require('pg');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// configure postgres
app.locals.pg_client = new Client ({
    connectionString: 'postgres://alkmcqiceuttgn:39c145375cf3471917847254875a23c8aaff06ab2e2b25eab95855092f40dd4f@ec2-54-163-255-181.compute-1.amazonaws.com:5432/df04ibepedjmrm',
    ssl: true,
});
app.locals.pg_client.connect();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//module.exports = app;
app.listen(8080, function () {
    console.log("Server running");
});
