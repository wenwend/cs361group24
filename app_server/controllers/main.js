var METERS_IN_MILE = 1609.344;

var request = require('request');
var rp = require('request-promise-native');
var moment = require('moment');

//connect to database
const { Client } = require('pg');
var client = new Client({
    user: 'alkmcqiceuttgn',
    password: '39c145375cf3471917847254875a23c8aaff06ab2e2b25eab95855092f40dd4f',
    database: 'df04ibepedjmrm',
    port: 5432,
    host: 'ec2-54-163-255-181.compute-1.amazonaws.com',
    ssl: true
});
client.connect();

/* GET home page */
module.exports.index = function(req, res) {
    res.render('index', { title: 'Food Trucks Fight Hunger' });
};

/* GET login page */
module.exports.login = function(req, res) {
    res.render('login');
};

/* POST login */
module.exports.postLogin = function(req, res, next) {
    const login = req.body;
    client.query('SELECT id, name FROM vendor WHERE name=($1);', [login.name], function(err, result) {
        if (err)
            return next(err);

        if (result.rows[0] !== undefined) {
            req.session.userId = result.rows[0].id;
            req.session.userName = result.rows[0].name;
            req.session.userType = "V";
            res.render('mainMenu', { name: req.session.userName });
        } else {
            res.render('login', { err: "Food truck " + login.name + " not found." });
        }
    });
};

/* POST login bank*/
module.exports.postLoginBank = function(req, res, next) {
    const login = req.body;
    client.query('SELECT id, name FROM bank WHERE name=($1);', [login.name], function(err, result) {
        if (err) {
            return next(err);
        }
        //res.send(200)
        if (result.rows[0] !== undefined) {
            req.session.userId = result.rows[0].id;
            req.session.userName = result.rows[0].name;
            req.session.userType = "B";
            res.render('mainMenuBank', { name: req.session.userName });
        } else {
            res.render('login', { err: "Food bank " + login.name + " not found." });
        }
    });
};

/* GET mainMenu page */
module.exports.mainMenu = function(req, res) {
    if (req.session.userId && req.session.userType == "V") {
        res.render('mainMenu', { name: req.session.userName });
    } else {
        res.render('login', { err: "You must be logged in as a food truck to access that page" });
    }
};

/* GET mainMenuBank page */
module.exports.mainMenuBank = function(req, res) {
    if (req.session.userId && req.session.userType == "B") {
        res.render('mainMenuBank', { name: req.session.userName });
    } else {
        res.render('login', { err: "You must be logged in as a food bank to access that page" });
    }
};

/* GET addDonation page */
module.exports.addDonation = function(req, res) {
    if (req.session.userId && req.session.userType == "V") {
        res.render('addDonation');
    } else {
        res.render('login', { err: "You must be logged in as a food truck to access that page" });
    }
};

/* POST new donation */
module.exports.postDonation = function(req, res, next) {
    if (req.session.userId && req.session.userType == "V") {
        const donation = req.body;
        client.query('INSERT INTO donation (id, status, date) VALUES ($1, $2, $3);', [req.session.userId, donation.dStatus, donation.date], function(err, result) {
            if (err) {
                return next(err);
            }
            //res.send(200)
            res.render('mainMenu');
        });
    } else {
        res.render('login', { err: "You must be logged in as a food truck to access that page" });
    }
};

/* GET donations */
module.exports.donations = function(req, res, next) {
    if (req.session.userId && req.session.userType == "V") {
        client.query('SELECT * FROM donation WHERE id=($1);', [req.session.userId], function(err, result) {
            if (err) {
                return next(err);
            }
            // res.json(result.rows)
            var donations = [];
            for (var i = 0; i < result.rows.length; i++) {
                donations[i] = 'Description: ' + result.rows[i].status + ' Date: ' + result.rows[i].date;
            }
            res.render('donations', { donations: donations });
        });
    } else {
        res.render('login', { err: "You must be logged in as a food truck to access that page" });
    }
};

/* GET nearby banks */
module.exports.banks = function(req, res, next) {
    if (req.session.userId && req.session.userType == "V") {
        client.query(
            'SELECT location, max_dis FROM vendor WHERE id=($1);',
            [req.session.userId],
            function(verr, vresult) {
                if (verr)
                    return next(verr);

                var radius = vresult.rows[0].max_dis;
                var vendor_location = vresult.rows[0].location;

                client.query(
                    'SELECT name, email, phone, location, open_at, close_at FROM bank WHERE location IS NOT NULL',
                    function(err, bresults) {
                        if (err)
                            return next(err);

                        // Create request promises for each result as
                        // it queries for the distance from vendor to
                        // bank.
                        var resultPromises = new Array();
                        for (var bank of bresults.rows) {
                            var url =
                                "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial"
                                + "&origins=" + bank.location
                                + "&destinations=" + vendor_location
                                + "&key=AIzaSyBkala2S1ZuGd3Tz8M3i6NT0_vAb07WU6U";
                            resultPromises.push(rp.get(url));
                        }

                        // When all request promises finish...
                        Promise.all(resultPromises).then(function(results) {
                            // Filter out banks from results whose
                            // distance is within vendor defined
                            // radius.
                            var validBanks = new Array();
                            for (var i = 0; i < results.length; ++i) {
                                var milesToBank =
                                    (JSON.parse(results[i]))["rows"][0]["elements"][0]["distance"]["value"] / METERS_IN_MILE;

                                if (milesToBank <= Math.abs(radius)) {
                                    // Format the open and close times
                                    var open = moment(bresults.rows[i].open_at, "H:m:s"),
                                        close = moment(bresults.rows[i].close_at, "H:m:s");
                                    bresults.rows[i].open_at = open.format("h:mmA");
                                    bresults.rows[i].close_at = close.format("h:mmA");

                                    bresults.rows[i].distance_to = milesToBank.toFixed(2);
                                    validBanks.push(bresults.rows[i]);
                                }
                            }

                            // Sort the banks based on distance
                            validBanks.sort(function(a, b) {
                                return a.distance_to - b.distance_to;
                            })

                            // Render page with valid banks.
                            res.render('banks',
                                {
                                    banks: validBanks,
                                    radius: radius,
                                    location: vendor_location
                                });
                        });
                    });
            });
    }
    else {
        res.render('login', { err: "You must be logged in as a food truck to access that page" });
    }
};

/* GET vendors */
module.exports.vendors = function(req, res, next) {
    client.query('SELECT * FROM vendor;', [], function(err, result) {
        if (err) {
            return next(err);
        }
        res.json(result.rows);
    });
};

/* GET new vendor */
module.exports.addVendor = function(req, res, next) {
    res.render('addVendor');
};

/* POST new vendor */
module.exports.postVendor = function(req, res, next) {
    const vendor = req.body;
    client.query('SELECT * FROM vendor WHERE name=($1) AND phone=($2)', [vendor.name, vendor.phone], function(err, result) {
        if (err) {
            return next(err);
        }
        if (result.rows.length == 0) {
            client.query('INSERT INTO vendor (type, name, email, phone, location, max_dis) VALUES ($1, $2, $3, $4, $5, $6);', ['V', vendor.name, vendor.email,
                vendor.phone, vendor.location, vendor.max_dis
            ], function(err, result) {
                if (err) {
                    return next(err);
                }
                //res.send(200)
                res.render('login');
            });
        } else {
            res.render('addVendor', { err: "The food truck " + vendor.name + " with the phone number " + vendor.phone + " is already registered." });
        }
    });
};
/* GET new bank */
module.exports.addBank = function(req, res, next) {
    res.render('addBank');
};

/* POST new bank */
module.exports.postBank = function(req, res, next) {
    const bank = req.body;
    client.query('SELECT * FROM bank WHERE name=($1) AND phone=($2)', [bank.name, bank.phone], function(err, result) {
        if (err) {
            return next(err);
        }
        if (result.rows.length == 0) {
            client.query('INSERT INTO bank (type, name, email, phone, open_at, close_at, location) VALUES ($1, $2, $3, $4, $5, $6, $7);', ['B', bank.name, bank.email, bank.phone, bank.open_at, bank.close_at, bank.location], function(err, result) {
                if (err) {
                    return next(err);
                }
                //res.send(200)
                res.render('login');
            });
        } else {
            res.render('addBank', { err: "The food bank " + bank.name + " with the phone number " + bank.phone + " is already registered." });
        }

    });
};
