const express = require('express');
const router = express.Router();

const Repair = require('../model/repair');

/**
 * PC获取部分维修人员信息的路由控制接口
 */
router.post('/cms/repair/readPart', function (req, res, next) {
  Repair.readPart(req, res, next);
});
/**
 * PC运维添加商店信息的路由控制接口
 */
router.post('/cms/repair/addShop', function (req, res, next) {
  Repair.addShop(req, res, next);
});
/**
 * PC运维删除商店信息的路由控制接口
 */
router.post('/cms/repair/delShop', function (req, res, next) {
  Repair.delShop(req, res, next);
});
/**
 * PC获取部分商店信息的路由控制接口
 */
router.post('/cms/repair/readShop', function (req, res, next) {
  Repair.readShop(req, res, next);
});

/**
 * PC获取某一维修人员信息的路由控制接口
 */
router.post('/cms/repair/readOne', function (req, res, next) {
  Repair.readOne(req, res, next);
});
/**
 * PC模糊搜索维修人员信息的路由控制接口
 */
router.post('/cms/repair/fuzzyHunt', function (req, res, next) {
  Repair.fuzzyHunt(req, res, next);
});
/**
 * PC维修人员名称检验的路由控制接口
 */
router.post('/cms/repair/checkName', function (req, res, next) {
  Repair.checkName(req, res, next);
});
/**
 * client获取维修人员信息的路由控制接口
 */
router.post('/client/repair/readPart', function (req, res, next) {
  Repair.read(req, res, next);
});
/**
 * PC新增维修人员信息路由控制接口
 */
router.post('/cms/repair/create', function (req, res, next) {
  Repair.create(req, res, next);
});
/**
 * PC更改维修人员信息路由控制接口
 */
router.post('/cms/repair/update', function (req, res, next) {
  Repair.update(req, res, next);
});
/**
 * PC上下架维修人员路由控制接口
 */
router.post('/cms/repair/remove', function (req, res, next) {
  Repair.remove(req, res, next);
});
/**
 * PC维修人员上传图片路由控制接口
 */
router.post('/cms/repair/upload', function (req, res, next) {
  Repair.upload(req, res, next);
});

module.exports = router;
