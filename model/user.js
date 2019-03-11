const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");
/**
 * 用户类Action
 */
class User {
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
     * 事务操作
     * @param {Array} sqlParamsEntity 
     */
    operationAffair(sqlParamsEntity) {
        return new Promise((resolve, reject) => {
            connection.execTrans(sqlParamsEntity, function (err, info) {
                if (!err) {
                    resolve(info);
                } else reject(new Error(err))
            })
        });
    }
    /**
     * 初始化sql & params：
     * @param {*} sql 
     * @param {*} params 
     * @param {*} callback 
     */
    _getNewSqlParamEntity(sql, params, callback) {
        if (callback) {
            return callback(null, {
                sql: sql,
                params: params
            });
        }
        return {
            sql: sql,
            params: params
        };
    }
    /**
     * 查询用户信息
     * 由于时间影响，将创建、查询用户合并
     */
    userinfo(req, res, next) {
        // 判断信息来源
        let type = req.path === '/client/userinfo';
        let param = req.body || req.query || req.params;
        if (type) {
            this.operationArgs(commands.user.client.isExist, [param.discern]).then(result => {
                if (result[0]['COUNT(id)'] > 0) {
                    this.operationArgs(commands.user.client.userinfo, [param.discern]).then(obj => {
                        connection.queryReturn(res, {
                            status: 1,
                            data: obj[0],
                            msg: '查询成功'
                        })
                    }).catch(err => console.log(err))
                } else {
                    let firstArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                    let firstName = firstArray[Math.round(Math.random() * 25)];
                    let lastArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                    let lastName = '';
                    lastArray.forEach(cur => {
                        lastName += lastArray[Math.round(Math.random() * 9)];
                    })
                    Object.assign(param, {
                        name: firstName + lastName,
                        creatTime: new Date().getTime(),
                    })
                    this.operation(commands.user.client.create(...this.modified(param))).then(() => {
                        this.userinfo(req, res, next);
                    }).catch(err => console.log(err))
                }
            })
        }

    }
    /**
     * 用户支付
     * 1.查询表shop_foods,用户购买商品数量与库存差值>0;查询表user,用户钱包是否足额
     * 2.更新表shop_foods
     * 3.表order新建订单
     * 4.表order_foods,更新订单与商品关联
     */
    pay(req, res, next) {
        let param = req.body || req.query || req.params;
        Promise.all([
            this.operation(commands.goods.client.getFood(param.shopId)),
            this.operation(commands.order.updateUserMoney(param.userId, param.money))
        ]).then(result => {
            let canGo = true;
            result[0].forEach(cur => {
                canGo = param.foods.filter(sub => {
                    if (sub.id === cur.foodId) {
                        return (cur.inventory - sub.count) < 0
                    }
                }).length <= 0
            })
            if (canGo) {
                if (result[1].affectedRows > 0) {
                    let shop_foods = Object.assign({}, param);
                    let foods = Object.assign({}, param);
                    shop_foods['updateTime'] = new Date().getTime();
                    foods['creatTime'] = new Date().getTime();
                    let sqlParamsEntity = [];
                    //更新shop_foods
                    param.foods.forEach(cur => {
                        sqlParamsEntity.push(this._getNewSqlParamEntity(commands.goods.client.updateFood(shop_foods.shopId, cur.id, cur.count)))
                    })
                    //更新user钱包余额
                    sqlParamsEntity.push(this._getNewSqlParamEntity(commands.order.updateUserMoney(param.userId, param.money)));
                    this.operationAffair(sqlParamsEntity).then(() => {
                            //表order,创建一条新的订单
                            return this.operation(commands.order.create(...this.modified(foods)))
                        }).then(() => {
                            //表order_foods,插入食物订单关联
                            let sqlFoods = []
                            param.foods.forEach(cur => {
                                sqlFoods.push(this._getNewSqlParamEntity(commands.order.contactFood(cur.id, cur.name, cur.count)))
                            })
                            return this.operationAffair(sqlFoods)
                        }).then(() => {
                            connection.queryReturn(res, {
                                status: 1,
                                msg: '支付成功'
                            })
                        })
                        .catch(err => connection.queryReturn(res, {
                            status: 0,
                            msg: '更新失败'
                        }))
                } else {
                    connection.queryReturn(res, {
                        status: 0,
                        msg: '余额不足'
                    })
                }
            } else {
                connection.queryReturn(res, {
                    status: 0,
                    msg: '库存不足'
                })
            }
        })
    }
    /**
     * 用户订单
     */
    order(req, res, next) {
        const baseUrl = req.protocol+'://'+req.headers.host;
        let param = req.body || req.query || req.params;
        this.operation(commands.order.gain(param.userId)).then(val => {
            //建立订单仓库
            let orderCache = [];
            //获取对应商店；获取对应商品
            orderCache = val.map(cur => Promise.all([
                this.operation(commands.order.getContactShop(cur.shopId)),
                this.operation(commands.order.getContactFood(cur.id))
            ]));
            Promise.all(orderCache).then(e => {
                //console.log(e);
                let orderReturn = [];
                orderReturn = e.map(((sub, index) => {
                    //let goo=val[index];
                    return {
                        ...val[index],
                        shop: sub[0].map(cur => {
                            return {
                                name: cur.name,
                                image: baseUrl+cur.image,
                                creatTime: cur.creatTime
                            }
                        })[0],
                        foods: sub[1].map(cur => {
                            return {
                                id: cur.foodsId,
                                name: cur.foodName,
                                count: cur.foodCount,
                            }
                        }),
                    }
                }))
                connection.queryReturn(res, {
                    status: 1,
                    data: orderReturn,
                    msg: '查询成功'
                })
            })
        }).catch(err => console.log(err))
    }
    /**
     * 用户评价
     * 1.更新订单评价状态
     * 2.表foods_evaluate,新建商品评价
     * 3.表shop_evaluate,新建店铺评价
     */
    evaluate(req, res, next) {
        let param = req.body || req.query || req.params;
        let sqlParamsEntity = [];
        //更新订单评价状态
        
        sqlParamsEntity.push(this._getNewSqlParamEntity(commands.order.updateOrderEval(param.id, param.evalStatus)));
        //表foods_evaluate,新建商品评价
        param.foods.forEach(cur => {
            sqlParamsEntity.push(this._getNewSqlParamEntity(commands.order.createFoodsEval(cur.id, param.userId, param.shopId, cur.like ? 1 : 0, new Date().getTime())));
        })
        //表shop_evaluate,新建店铺评价
        sqlParamsEntity.push(this._getNewSqlParamEntity(commands.order.createShopEval(param.shopId, param.userId, param.score, param.text, new Date().getTime())));

        this.operationAffair(sqlParamsEntity).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '评论成功'
            })

        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '评论失败'
            })
        });
    }
    /**
     * 查询部分用户名
     */
    readPart(req, res, next) {
        let param = req.body || req.query || req.params;
        let total = null;
        this.operation(commands.user.cms.readAllNum(param.name)).then(val => {
            return Promise.all([this.operationArgs(commands.user.cms.readPart(...this.modified(param)), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
        }).then(([result, total]) => {
            connection.queryReturn(res, {
                status: 1,
                data: result,
                total: total,
                msg: '查询成功'
            });
        }).catch(err => console.log(err))

    }

    /**
     * 改变读取数据类型
     * @param {Object} param 
     */
    modified(param) {
        let key = [],
            val = [];
        for (let i in param) {
            if (i === 'id') {
                delete param[i];
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
}

module.exports = new User();