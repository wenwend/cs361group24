var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET new vendor */
router.get('/', ctrlMain.addVendor);


module.exports = router;
