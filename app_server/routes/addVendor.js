var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET addVendor page */
router.get('/', ctrlMain.addVendor);

module.exports = router;
