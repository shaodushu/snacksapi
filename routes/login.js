const express = require('express');
const router = express.Router();

const Login = require('../model/login');

/**
 * 登录后台的路由控制接口
 */
router.post('/userAuth', function (req, res, next) {
    Login.userAuth(req, res, next);
});
/**
 * 退出后台的路由控制接口
 */
router.get('/out', function (req, res, next) {
    Login.out(req, res, next);
});

module.exports = router;
