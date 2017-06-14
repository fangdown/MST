var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var callback = req.query.callback;
  var data = {
    'success': true,
    'data': 'hello resource'
  }
  console.log(callback);
  res.send(callback + '(' + JSON.stringify(data) + ')');
});

module.exports = router;
