const express = require('express');
const router = express.Router();

const Order = require('../model/order');

/**
 * PC获取部分用户信息的路由控制接口
 */
router.post('/cms/order/readPart', function (req, res, next) {
    Order.readPart(req, res, next);
});



module.exports = router;
