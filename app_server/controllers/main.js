//connect to database
const { Client } = require('pg');
var client = new Client ({
        user: 'alkmcqiceuttgn',
        password: '39c145375cf3471917847254875a23c8aaff06ab2e2b25eab95855092f40dd4f',
        database: 'df04ibepedjmrm',
        port: 5432,
        host: 'ec2-54-163-255-181.compute-1.amazonaws.com',
        ssl: true
    });
client.connect();

/* GET home page */
module.exports.index = function(req, res){
      res.render('index', { title: 'Food Trucks Fight Hunger' });
};

/* GET login page */
module.exports.login = function(req, res){
      res.render('login');
};

/* POST login */
module.exports.postLogin = function(req, res, next) {
    const login = req.body
    client.query('SELECT id, name FROM vendor WHERE name=($1);', [login.name], function (err, result) {
        if (err) {
            return next(err)
        }
        //res.send(200)
        if (result.rows[0] != undefined) {
            req.session.userId = result.rows[0].id;
            req.session.userName = result.rows[0].name;
            res.render('mainMenu', { name: req.session.userName });
        } 
        else {
            res.render('login');
        }
    })
};

/* GET mainMenu page */
module.exports.mainMenu = function(req, res){
      res.render('mainMenu');
};

/* GET addDonation page */
module.exports.addDonation = function(req, res){
      res.render('addDonation');
};

/* POST new donation */
module.exports.postDonation = function(req, res, next) {
    const donation = req.body
    client.query('INSERT INTO donation (id, status, date) VALUES ($1, $2, $3);', [req.session.userId, donation.dStatus, donation.date], function (err, result) {
        if (err) {
            return next(err)
        }
        //res.send(200)
        res.render('mainMenu')
    })
};

/* GET donations */
module.exports.donations= function(req, res, next) {
    client.query('SELECT * FROM donation WHERE id=($1);', [req.session.userId], function (err, result) {
        if (err) {
            return next (err)
        }
        res.json(result.rows)
    })
};

/* GET vendors */
module.exports.vendors = function(req, res, next) {
    client.query('SELECT * FROM vendor;', [], function (err, result) {
        if (err) {
            return next (err)
        }
        res.json(result.rows)
    })
};

/* GET new vendor */
module.exports.addVendor = function(req, res, next) {
    res.render('addVendor');
};

/* POST new vendor */
module.exports.postVendor = function(req, res, next) {
    const vendor = req.body
    client.query('INSERT INTO vendor (type, name, email) VALUES ($1, $2, $3);', ['V', vendor.name, vendor.email], function (err, result) {
        if (err) {
            return next(err)
        }
        //res.send(200)
        res.render('login')
    })
};
/* GET new bank */
module.exports.addBank = function(req, res, next) {
    res.render('addBank');
};

/* POST new bank */
module.exports.postBank = function(req, res, next) {
    const vendor = req.body
    client.query('INSERT INTO bank (type, name, email, phone, open_at, close_at, open_date) VALUES ($1, $2, $3, $4, $5, $6, $7);', 
        ['B', bank.name, bank.email, bank.phone,
        bank.open_at, bank.close_at, bank,open_date], function (err, result) {
        if (err) {
            return next(err)
        }
        res.send(200)
    })
};
