var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET vendors */
router.get('/', ctrlMain.vendors);

module.exports = router;
