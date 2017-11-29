var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET donations */
router.get('/', ctrlMain.searchByDate);

module.exports = router;
