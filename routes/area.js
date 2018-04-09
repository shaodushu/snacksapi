const express = require('express');
const router = express.Router();

const Area = require('../model/area');

/**
 * PC获取部分区域信息的路由控制接口
 */
router.post('/cms/area/readPart', function (req, res, next) {
    Area.readPart(req, res, next);
});
/**
 * PC获取某一区域信息的路由控制接口
 */
router.post('/cms/area/readOne', function (req, res, next) {
    Area.readOne(req, res, next);
});
/**
 * PC区域名称检验的路由控制接口
 */
router.post('/cms/area/checkName', function (req, res, next) {
    Area.checkName(req, res, next);
});

/**
 * PC新增区域信息路由控制接口
 */
router.post('/cms/area/create', function (req, res, next) {
    Area.create(req, res, next);
});
/**
 * PC更改区域信息路由控制接口
 */
router.post('/cms/area/update', function (req, res, next) {
    Area.update(req, res, next);
});
/**
 * PC改变区域状态路由控制接口
 */
router.post('/cms/area/remove', function (req, res, next) {
    Area.remove(req, res, next);
});


module.exports = router;
