const express = require('express');
const router = express.Router();

const Shop = require('../model/shop');

/**
 * PC商店添加商品信息的路由控制接口
 */
router.post('/cms/shop/addGoods', function (req, res, next) {
    Shop.addGoods(req, res, next);
});
/**
 * 获取二维码
 */
router.get('/cms/shop/qrCode', function (req, res, next) {
    Shop.qrCode(req, res, next);
});
/**
 * PC商店删除商品信息的路由控制接口
 */
router.post('/cms/shop/delGood', function (req, res, next) {
    Shop.delGood(req, res, next);
});
/**
 * CLIENT获取周边商店的路由控制接口
 */
router.post('/client/shop/circum', function (req, res, next) {
    Shop.circum(req, res, next);
});
/**
 * CLIENT获取某一商店信息的路由控制接口
 */
router.post('/client/shop/readOne', function (req, res, next) {
    Shop.readOne(req, res, next);
});
/**
 * CLIENT获取商店评价信息的路由控制接口
 */
router.post('/client/shop/ratings', function (req, res, next) {
    Shop.ratings(req, res, next);
});
/**
 * PC获取部分商店信息的路由控制接口
 */
router.post('/cms/shop/readPart', function (req, res, next) {
    Shop.readPart(req, res, next);
});
/**
 * PC获取某一商店信息的路由控制接口
 */
router.post('/cms/shop/readOne', function (req, res, next) {
    Shop.readOne(req, res, next);
});
/**
 * PC获取某一商店商品信息的路由控制接口
 */
router.post('/cms/shop/readGoods', function (req, res, next) {
    Shop.readGoods(req, res, next);
});

/**
 * PC商店名称检验的路由控制接口
 */
router.post('/cms/shop/checkName', function (req, res, next) {
    Shop.checkName(req, res, next);
});
/**
 * client获取商店信息的路由控制接口
 */
router.post('/client/shop/readPart', function (req, res, next) {
    Shop.read(req, res, next);
});
/**
 * PC新增商店信息路由控制接口
 */
router.post('/cms/shop/create', function (req, res, next) {
    Shop.create(req, res, next);
});
/**
 * PC更改商店信息路由控制接口
 */
router.post('/cms/shop/update', function (req, res, next) {
    Shop.update(req, res, next);
});
/**
 * PC改变商店状态路由控制接口
 */
router.post('/cms/shop/remove', function (req, res, next) {
    Shop.remove(req, res, next);
});
/**
 * PC商店图片上传路由控制接口
 */
router.post('/cms/shop/upload', function (req, res, next) {
    Shop.upload(req, res, next);
});
/**
 * PC模糊搜索商店信息的路由控制接口
 */
router.post('/cms/shop/fuzzyHunt', function (req, res, next) {
    Shop.fuzzyHunt(req, res, next);
});
/**
 * 获取商店销售排名
 */
router.get('/v1/shop/sales', function (req, res, next) {
    Shop.sales(req, res, next);
});
module.exports = router;
