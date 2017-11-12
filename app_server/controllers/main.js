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
      res.render('index', { title: 'Express' });
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
        res.send(200)
    })
};
