const express = require('express');
const router = express.Router();

const Repair = require('../model/repair');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
/**
 * 增加维修人员的路由控制接口
 */
router.get('/addRepair', function(req, res, next) {
  Repair.addRepair(req,res,next)
});

module.exports = router;
