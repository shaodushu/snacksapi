const express = require('express');
const router = express.Router();

const Shop = require('../model/shop');

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

module.exports = router;
