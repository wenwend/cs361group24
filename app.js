var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// routes
var index = require('./app_server/routes/index');
var vendors = require('./app_server/routes/vendors');
var addVendor = require('./app_server/routes/addVendor');
var postVendor = require('./app_server/routes/postVendor');
var login = require('./app_server/routes/login');
var postLogin = require('./app_server/routes/postLogin');
var postLoginBank = require('./app_server/routes/postLoginBank');
var mainMenu = require('./app_server/routes/mainMenu');
var mainMenuBank = require('./app_server/routes/mainMenuBank');
var getDonatable = require('./app_server/routes/getDonatable');
var addDonatable = require('./app_server/routes/addDonatable');
var postDonatable = require('./app_server/routes/postDonatable');
var donations = require('./app_server/routes/donations');
var donationDetails = require('./app_server/routes/donationDetails');
var postDonation = require('./app_server/routes/postDonation');
var banks = require('./app_server/routes/banks');
var addBank = require('./app_server/routes/addBank');
var postBank = require('./app_server/routes/postBank');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// session cookie
app.use(session({ secret: 'keyboard car', cookie: { maxAge: 60000 } }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/vendors', vendors);
app.use('/addVendor', addVendor);
app.use('/postVendor', postVendor);
app.use('/login', login);
app.use('/postLogin', postLogin);
app.use('/postLoginBank', postLoginBank);
app.use('/mainMenu', mainMenu);
app.use('/mainMenuBank', mainMenuBank);
app.use('/addDonatable', addDonatable);
app.use('/postDonatable', postDonatable);
app.use('/getDonatable', getDonatable);
app.use('/donations', donations);
app.use('/donationDetails', donationDetails);
spp.use('/postDonation', postDonation);
app.use('/banks', banks);
app.use('/addBank', addBank);
app.use('/postBank', postBank);

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

module.exports = app;

app.listen(8080, function() {
    console.log("Server running");
});