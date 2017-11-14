var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET main menu page. */
router.get('/', ctrlMain.mainMenuBank);

module.exports = router;
