var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET addDonation page */
router.get('/', ctrlMain.getDonatable);

module.exports = router;
