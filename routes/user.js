const express = require('express');
const router = express.Router();

const User = require('../model/user');

/**
 * PC获取部分用户信息的路由控制接口
 */
router.post('/cms/user/readPart', function (req, res, next) {
    User.readPart(req, res, next);
});
/**
 * CLIENT获取某一用户信息的路由控制接口
 */
router.post('/client/userinfo', function (req, res, next) {
    User.userinfo(req, res, next);
});
/**
 * CLIENT用户支付的路由控制接口
 */
router.post('/client/user/pay', function (req, res, next) {
    User.pay(req, res, next);
});
/**
 * CLIENT用户订单的路由控制接口
 */
router.post('/client/user/order', function (req, res, next) {
    User.order(req, res, next);
});
/**
 * CLIENT用户评价的路由控制接口
 */
router.post('/client/user/evaluate', function (req, res, next) {
    User.evaluate(req, res, next);
});
/**
 * PC新增用户信息路由控制接口
 */
router.post('/cms/user/create', function (req, res, next) {
    User.create(req, res, next);
});
/**
 * PC更改用户信息路由控制接口
 */
router.post('/cms/user/update', function (req, res, next) {
    User.update(req, res, next);
});



module.exports = router;
