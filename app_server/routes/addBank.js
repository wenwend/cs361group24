var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET new bank */
router.get('/', ctrlMain.addBank);


module.exports = router;
