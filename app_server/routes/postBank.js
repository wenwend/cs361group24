var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* POST new bank */
router.post('/', ctrlMain.postBank);


module.exports = router;
