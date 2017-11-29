var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* POST confirmDonation page */
router.post('/', ctrlMain.confirmDonation);

module.exports = router;
