const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");

//食物类型
const foodsType = require('../libs/foodsType');
/**
 * 商品类Action
 */
class Goods {
    /**
     * Promise 有参数
     * @param {String} sql
     * @param {*} args
     */
    operationArgs(sql, args) {
        return new Promise((resolve, reject) => {
            connection.queryArgs(sql, args, (err, result) => {
                if (!err) {
                    resolve(result);
                } else reject(new Error(err));
            });
        })
    }
    /**
     * Promise 无参数
     * @param {String} sql
     */
    operation(sql) {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (!err) {
                    resolve(result);
                } else reject(new Error(err));
            });
        })
    }
    /**
     * 检查商品名是否重复
     */
    checkName(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.goods.cms.checkName, [param.name]).then(val => {
            connection.queryReturn(res, {
                status: 1,
                data: val[0]['COUNT(id)'],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 查询一个商品名
     */
    readOne(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.goods.cms.readOne, [param.goodsId]).then(val => {
            delete val[0].oldPrice;
            connection.queryReturn(res, {
                status: 1,
                data: val[0],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 模糊搜索商品信息
     */
    fuzzyHunt(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operation(commands.goods.cms.fuzzyHunt(param.keyword)).then(val => {
            const list = val.length > 0 ? val.map(item => {
                return {
                    value: item.id,
                    label: item.name,
                    type: item.type,
                    inventory: item.inventory
                };
            }) : [];
            connection.queryReturn(res, {
                status: 1,
                data: list,
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 查询部分商品名
     */
    readPart(req, res, next) {
        const baseUrl = req.protocol + '://' + req.headers.host;
        // 判断信息来源
        let type = req.path === '/cms/goods/readPart';
        let param = req.body || req.query || req.params;
        let total = null;
        //管理后台
        if (type) {
            this.operation(commands.goods.cms.readAllNum(param.name)).then(val => {
                return Promise.all([this.operationArgs(commands.goods.cms.readPart(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
            }).then(([result, total]) => {
                connection.queryReturn(res, {
                    status: 1,
                    data: result,
                    total: total,
                    msg: '查询成功'
                });
            }).catch(err => console.log(err))
        }
        //移动端
        else {
            if (param.shopId !== 'undefined') {
                Promise.all([
                        //从对应商店找出库存大于零的商品
                        this.operation(commands.goods.client.getFoodId(param.shopId)),
                        //获取食物销售量
                        this.operation(commands.goods.client.getFoodSales),
                        //获取食物评价
                        this.operationArgs(commands.goods.client.getShopFoodEval, [param.shopId])
                    ]).then(e => {
                        let foods = e[0];
                        //建立临时存储食物ID
                        let foodIdCache = [];
                        foods.forEach(cur => {
                            Object.assign(cur, e[1].filter(sub => sub.foodId === cur.foodId)[0], e[2].filter(sub => sub.foodId === cur.foodId)[0]);
                            foodIdCache.push(cur.foodId)
                        })
                        return Promise.all([this.operation(commands.goods.client.getFoodInfo(foodIdCache.join())), foods])
                    }).then(([infoA, infoB]) => {
                        let copyFoodsType = [];
                        //数组深度遍历
                        copyFoodsType = JSON.parse(JSON.stringify(foodsType))
                        infoA.forEach(obj => {
                            if (obj.image) {
                                obj.image = baseUrl+obj.image.split(';')[0];
                            }
                            Object.assign(obj, infoB.filter(fit => fit.foodId === obj.id).map(cur => {
                                return {
                                    sellCount: cur.foodCount,
                                    rating: (cur.score / cur['count(*)'] * 100).toFixed(2) + "%"
                                }
                            })[0])
                            copyFoodsType[obj.type].foods.push(obj);
                        })
                        connection.queryReturn(res, {
                            status: 1,
                            data: copyFoodsType.filter(cur => cur.foods.length > 0),
                            msg: '查询成功'
                        })
                    })
                    .catch(err => {
                        connection.queryReturn(res, {
                            status: 0,
                            msg: '查询失败'
                        })
                    })
            } else {
                connection.queryReturn(res, {
                    status: 0,
                    msg: '请选择商店'
                })
            }

        }
    }
    /**
     * 改变读取数据类型
     * @param {Object} param
     */
    modified(param) {
        let key = [],
            val = [];
        for (let i in param) {
            if (i === 'pdtTime') {
                param[i] = Date.parse(param[i]);
            } else if (i === 'id') {
                delete param[i];
            } else if (i === 'pdtArea') {
                param[i] = param[i].join('/');
            } else if (typeof param[i] === 'string') {
                key.push(i);
                val.push('"' + param[i] + '"');
            } else if (typeof param[i] === 'number') {
                key.push(i);
                val.push(param[i]);
            }
        }
        return [key, val];
    }
    /**
     * 新建商品
     */
    create(req, res, next) {
        let param = req.body || req.query || req.params;
        if (param.image.length > 0) {
            param.image = param.image.map(cur => cur.url).filter(cur=>cur.length>0).join(";");
        }
        if (param.id) {
            this.update(req, res, next);
        } else {
            this.operation(commands.goods.cms.create(...this.modified(param))).then(() => {
                connection.queryReturn(res, {
                    status: 1,
                    msg: '添加成功'
                });
            }).catch(err => connection.queryReturn(res, {
                status: 0,
                msg: '添加失败'
            }));
        }

    }
    /**
     * 更新商品数据
     */
    update(req, res, next) {
        let param = req.body || req.query || req.params;
        let goodsId = param.id;
        this.operationArgs(commands.goods.cms.replace, [goodsId]).then(() => {
            return this.operationArgs(commands.goods.cms.update(...this.modified(param)), [goodsId]);
        }).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 改变商品状态
     */
    remove(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.goods.cms.remove, [param.status, param.id]).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 上传商品图片
     */
    upload(req, res, next) {
        //Creates a new incoming form.
        const form = new formidable.IncomingForm();
        //服务器地址
        const baseUrl = req.headers.host;
        form.uploadDir = path.normalize(__dirname + '/../public/pic/goods');
        //执行里面的回调函数的时候，表单已经全部接收完毕了。
        form.parse(req, (err, fields, files) => {
            const t = sd.format(new Date(), 'YYYYMMDDHHmmss');
            const ran = parseInt(Math.random() * 8999 + 10000);
            const extname = path.extname(files.file.name);
            const oldpath = files.file.path;
            const newpath = __dirname + '/../public/pic/goods/' + t + ran + extname;
            fs.rename(oldpath, newpath, err => {
                if (err) {
                    res.send({
                        status: 0,
                        msg: '上传失败'
                    })
                } else res.send({
                    status: 1,
                    url: '/pic/goods/' + t + ran + extname,
                    msg: '上传成功'
                });
            });
        });
    }
    /**
     * 食物销售排名
     */
    sales(req, res, next) {
        let param = req.query;
        this.operation(commands.goods.cms.sales).then(data => {
            connection.queryReturn(res, {
                status: 1,
                data,
                msg: '查询成功'
            });
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '查询失败'
            })
        })
    }
}

module.exports = new Goods();