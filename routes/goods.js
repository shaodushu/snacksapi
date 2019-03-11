const express = require('express');
const router = express.Router();

const Goods = require('../model/goods');

/**
 * PC获取部分商品信息的路由控制接口
 */
router.post('/cms/goods/readPart', function (req, res, next) {
    Goods.readPart(req, res, next);
});
/**
 * client获取商品信息的路由控制接口
 */
router.post('/client/goods/readPart', function (req, res, next) {
    Goods.readPart(req, res, next);
});
/**
 * PC获取某一商品信息的路由控制接口
 */
router.post('/cms/goods/readOne', function (req, res, next) {
    Goods.readOne(req, res, next);
});
/**
 * PC模糊搜索商品信息的路由控制接口
 */
router.post('/cms/goods/fuzzyHunt', function (req, res, next) {
    Goods.fuzzyHunt(req, res, next);
});
/**
 * PC商品名称检验的路由控制接口
 */
router.post('/cms/goods/checkName', function (req, res, next) {
    Goods.checkName(req, res, next);
});

/**
 * PC新增商品信息路由控制接口
 */
router.post('/cms/goods/create', function (req, res, next) {
    Goods.create(req, res, next);
});
/**
 * PC更改商品信息路由控制接口
 */
router.post('/cms/goods/update', function (req, res, next) {
    Goods.update(req, res, next);
});
/**
 * PC上下架商品路由控制接口
 */
router.post('/cms/goods/remove', function (req, res, next) {
    Goods.remove(req, res, next);
});
/**
 * PC商店图片上传路由控制接口
 */
router.post('/cms/goods/upload', function (req, res, next) {
    Goods.upload(req, res, next);
});
/**
 * 获取食物销售排名
 */
router.get('/v1/goods/sales', function (req, res, next) {
    Goods.sales(req, res, next);
});

module.exports = router;
