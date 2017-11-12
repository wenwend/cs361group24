var express = require('express');
var router = express.Router();
var ctrlMain = require('../controllers/main');

/* GET users */
router.get('/', ctrlMain.users);

module.exports = router;
