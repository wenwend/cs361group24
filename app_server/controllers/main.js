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

/* POST vendor login */
module.exports.postLogin = function(req, res, next) {
	const login = req.body;

	/* Check encrypted password of type chkpass.
	   To compare, simply compare against a clear text password and the comparison function will encrypt it before comparing.  */
	client.query('SELECT id, name, pass = ($2) as validated FROM vendor WHERE name=($1);', [login.name, login.pass], function(err, result) {
		if (err)
			return next(err);

		if (result.rows[0] && result.rows[0].validated) {
			req.session.userId = result.rows[0].id;
			req.session.userName = result.rows[0].name;
			req.session.userType = "V";
			res.render('mainMenu', { name: req.session.userName });
		} else {
			res.render('login', { err: "Invalid food truck credentials." });
		}
	});
};

/* POST login bank*/
module.exports.postLoginBank = function(req, res, next) {
	const login = req.body;
	/* Check encrypted password of type chkpass.*/
	client.query('SELECT id, name, pass =($2) as validated FROM bank WHERE name=($1);', [login.name, login.pass], function(err, result) {
		if (err) {
			return next(err);
		}

		if (result.rows[0] && result.rows[0].validated) {
			req.session.userId = result.rows[0].id;
			req.session.userName = result.rows[0].name;
			req.session.userType = "B";
			client.query('SELECT donation_id FROM completed_donations WHERE bank_id=($1) AND NOT confirmed;', [req.session.userId], function(err, result) {
				if (err) {
					return next(err);
				}
            res.redirect('/mainMenuBank');
			});
		} else {
			res.render('login', { err: "Invalid food bank credentials." });
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
		client.query('SELECT donation_id FROM completed_donations WHERE bank_id=($1) AND NOT confirmed;', [req.session.userId], function(err, result) {
			if (err) {
				return next(err);
			}
			res.render('mainMenuBank', { name: req.session.userName, numOfDonations: result.rows.length, unconfirmedDonations: result.rows });
		});
	} else {
		res.render('login', { err: "You must be logged in as a food bank to access that page" });
	}
};

/* GET addDonation page */
module.exports.addDonatable = function(req, res) {
	if (req.session.userId && req.session.userType == "V") {
		res.render('addDonatable');
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

/* POST new donation */
module.exports.postDonatable = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V") {
		const donation = req.body;
		client.query('INSERT INTO donation (status, date, vendor_id, time) VALUES ($1, $2, $3, $4);', [donation.dStatus, donation.date,
			req.session.userId, donation.time
		], function(err, result) {
			if (err) {
				return next(err);
			}
			//res.send(200)
			res.render('mainMenu', { name: req.session.userName });
		});
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

/* GET donatable food */
module.exports.getDonatable = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V") {
		client.query('SELECT * FROM donation WHERE vendor_id=($1);', [req.session.userId], function(err, result) {
			if (err) {
				return next(err);
			}
			res.json(result.rows);
		});
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

/* GET donations */
module.exports.donations = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V") {
		client.query('SELECT * FROM donation WHERE vendor_id=($1);', [req.session.userId], function(err, result) {
			if (err) {
				return next(err);
			}
			// res.json(result.rows)
			var donations = [];
			for (var i = 0; i < result.rows.length; i++) {
				var prettyDate = result.rows[i].date.toString().split("00:")[0];
				donations[i] = {
					description: result.rows[i].status,
					date: prettyDate,
					time: result.rows[i].time,
					id: result.rows[i].id
				};
			}
			res.render('donations', { name: req.session.userName, donations: donations });
		});
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

/* GET donation report */
module.exports.searchByDate = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V") {
		//const temp = req.query;
		client.query('SELECT * FROM donation WHERE vendor_id=($1) AND date between ($2) AND ($3) ;', [req.session.userId,req.query.start,req.query.end], function(err, result) {
			if (err) {
				return next(err);
			}
			//res.json(result.rows)
			var donations = [];
			for (var i = 0; i < result.rows.length; i++) {
				var prettyDate = result.rows[i].date.toString().split("00:")[0];
				donations[i] = {
					description: result.rows[i].status,
					date: prettyDate,
					time: result.rows[i].time,
					id: result.rows[i].id
				};
			}
			res.render('searchByDate', { name: req.session.userName, timestart: req.query.start, timeend: req.query.end, donations: donations });
		});
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

/* GET donation details */
module.exports.donationDetails = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V" && req.query.id) {
		client.query('SELECT * FROM donation WHERE id=($1);', [req.query.id], function(err, result) {
			if (err) {
				return next(err);
			}
			//res.json(result.rows);
			var prettyDate = result.rows[0].date.toString().split("00:")[0];
			var details = {
				id: result.rows[0].id,
				description: result.rows[0].status,
				date: prettyDate,
				time: result.rows[0].time
			};

			res.render('donationDetails', { details });
		});
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

module.exports.postDonation = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V") {
		var donation = req.body;
		var ids = donation['donations[]'];

		// handle single or multiple donations differently
		if (Array.isArray(ids) == false) {
			client.query('INSERT INTO completed_donations (vendor_id, bank_id, donation_id, confirmed) VALUES($1, $2, $3, $4);', [req.session.userId, donation.bankId, ids, false], function(err, result) {
				if (err) {
					return next(err);
				}
			});
		} else {

		for (var i in ids) {
			client.query('INSERT INTO completed_donations (vendor_id, bank_id, donation_id, confirmed) VALUES($1, $2, $3, $4);', [req.session.userId, donation.bankId, ids[i], false], function(err, result) {
				if (err) {
					return next(err);
				}
			});
		}

/*
		donation['donations[]'].forEach(function(donation_id) {
			client.query('INSERT INTO completed_donations (vendor_id, bank_id, donation_id, confirmed) VALUES($1, $2, $3, $4);', [req.session.userId, donation.bankId, donation_id, false], function(err, result) {
				if (err) {
					return next(err);
				}
			});
			*/
		};
		res.send(req.body);
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};

/* GET all completed donations */
module.exports.completedDonations = function(req, res, next) {
	client.query('SELECT * FROM completed_donations;', [], function(err, result) {
		if (err) {
			return next(err);
		}
		res.json(result.rows);
	});
};

/* GET nearby banks */
module.exports.banks = function(req, res, next) {
	if (req.session.userId && req.session.userType == "V") {
		client.query(
			'SELECT location, max_dis FROM vendor WHERE id=($1);', [req.session.userId],
			function(verr, vresult) {
				if (verr)
					return next(verr);

				var radius = vresult.rows[0].max_dis;
				var vendor_location = vresult.rows[0].location;

				client.query(
					'SELECT id, name, email, phone, location, open_at, close_at FROM bank WHERE location IS NOT NULL',
					function(err, bresults) {
						if (err)
							return next(err);

						// Create request promises for each result as
						// it queries for the distance from vendor to
						// bank.
						var resultPromises = new Array();
						for (var bank of bresults.rows) {
							var url =
								"https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial" +
								"&origins=" + bank.location +
								"&destinations=" + vendor_location +
								"&key=AIzaSyBkala2S1ZuGd3Tz8M3i6NT0_vAb07WU6U";
							resultPromises.push(rp.get(url));
						}

						// When all request promises finish...
						Promise.all(resultPromises).then(function(results) {
							// Filter out banks from results whose
							// distance is within vendor defined
							// radius.
							var validBanks = new Array();
							for (var i = 0; i < results.length; ++i) {
								if ((JSON.parse(results[i]))["rows"][0]["elements"][0]["status"] == "OK") {
									var milesToBank =
										(JSON.parse(results[i]))["rows"][0]["elements"][0]["distance"]["value"] / METERS_IN_MILE;

									if (milesToBank <= Math.abs(radius)) {
										// Format the open and close times
										var open = moment(bresults.rows[i].open_at, "H:m:s"),
											close = moment(bresults.rows[i].close_at, "H:m:s");
										bresults.rows[i].open_at = open.format("h:mmA");
										bresults.rows[i].close_at = close.format("h:mmA");

										// Format the phone number
										var phone = bresults.rows[i].phone;
										bresults.rows[i].phone = phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6);

										bresults.rows[i].distance_to = milesToBank.toFixed(2);
										validBanks.push(bresults.rows[i]);
									}
								}
							}

							// Sort the banks based on distance
							validBanks.sort(function(a, b) {
								return a.distance_to - b.distance_to;
							});

							// Render page with valid banks.
							res.render('banks', {
								banks: validBanks,
								radius: radius,
								location: vendor_location
							});
						});
					});
			});
	} else {
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
			client.query('INSERT INTO vendor (type, name, email, pass, phone, location, max_dis) VALUES ($1, $2, $3, $4, $5, $6, $7);', ['V', vendor.name, vendor.email, vendor.pass,
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
			client.query('INSERT INTO bank (type, name, email, pass, phone, open_at, close_at, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);', ['B', bank.name, bank.email, bank.pass, bank.phone, bank.open_at, bank.close_at, bank.location], function(err, result) {
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

/* POST donation confirmation*/
module.exports.confirmDonation = function(req, res, next) {
	if (req.session.userId && req.session.userType == "B") {
		const donation = req.body;
		client.query('UPDATE completed_donations SET confired = $1 where donation_id = $2;', [false, donation.donId], function(err, result) {
			if (err) {
				return next(err);
			}
        });
	    client.query('DELETE from WHERE id = $1;', [donation.donId], function(err, result) {
            if (err) {
                return next(err);
            }
		});
        res.redirect('/mainMenuBank');
	} else {
		res.render('login', { err: "You must be logged in as a food truck to access that page" });
	}
};
