var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET all completed donations */
router.get('/', ctrlMain.completedDonations);

module.exports = router;