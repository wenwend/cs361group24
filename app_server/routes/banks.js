var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET banks */
router.get('/', ctrlMain.banks);

module.exports = router;