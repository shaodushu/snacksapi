// import {
//     resolve
// } from 'dns';

const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");
const qr = require('qr-image')
/**
 * 商店类Action
 */
class Shop {
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
     * 商店添加商品
     * 1.商店是否存储该商品。
     * 2.是，更新商品信息；否，创建商品信息。
     * 3.商品库存变化采用事务
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    addGoods(req, res, next) {
        let param = req.body || req.query || req.params;
        param['updateTime'] = new Date().getTime();
        this.operationArgs(commands.shop.cms.hasThisGood, [param.shopId, param.foodId]).then(cur => {
            if (cur[0]['COUNT(id)'] > 0) {
                this.updateGoods(req, res, next);
            } else {
                param['creatTime'] = new Date().getTime();
                let sqlParamsEntity = [];

                let sql1 = commands.shop.cms.createGood(...this.modified(param));
                //let args1 = [param.shopId, param.foodId];//, args1
                sqlParamsEntity.push(this._getNewSqlParamEntity(sql1));

                let sql2 = commands.shop.cms.reduceGoodNum(param.inventory);
                let args2 = [param.foodId];
                sqlParamsEntity.push(this._getNewSqlParamEntity(sql2, args2));

                this.operationArgs(commands.goods.cms.readOne, [param.foodId]).then(val => {
                    if (parseInt(val[0].inventory) >= parseInt(param.inventory)) {
                        this.operationAffair(sqlParamsEntity).then(() => {
                            connection.queryReturn(res, {
                                status: 1,
                                msg: '更新成功'
                            });
                        }).catch(err => connection.queryReturn(res, {
                            status: 0,
                            msg: '更新失败'
                        }))
                    } else {
                        connection.queryReturn(res, {
                            status: 0,
                            msg: '库存不足'
                        });
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err));
    }
    circum(req, res, next) {
        const baseUrl = req.protocol + '://' + req.headers.host;
        let param = req.body || req.query || req.params;
        this.operation(commands.shop.client.allShop).then(cur => {
            let shopData = cur.filter(cur => this.getDistance(param.lat, param.lng, cur.latitude, cur.longitude) < param.radius);
            connection.queryReturn(res, {
                status: 1,
                data: shopData.map(cur => {
                    cur.image = baseUrl + cur.image
                    return cur
                }),
                msg: '查询成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 计算两个坐标点的距离
     * @param {*} lat1 
     * @param {*} lng1 
     * @param {*} lat2 
     * @param {*} lng2 
     */
    getDistance(lat1, lng1, lat2, lng2) {
        var dis = 0;
        var radLat1 = toRadians(lat1);
        var radLat2 = toRadians(lat2);
        var deltaLat = radLat1 - radLat2;
        var deltaLng = toRadians(lng1) - toRadians(lng2);
        var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
        return dis * 6378137;

        function toRadians(d) {
            return d * Math.PI / 180;
        }
    }
    delGood(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.shop.cms.deleteGood, [param.id]).then(cur => {

            connection.queryReturn(res, {
                status: 1,
                msg: '删除成功'
            });
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '删除失败'
            });
        })
    }
    /**
     * 商店更新商品信息
     * 1.判断库存是否大于更新值
     * 2.处理事务
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    updateGoods(req, res, next) {
        let param = req.body || req.query || req.params;
        let sqlParamsEntity = [];

        let sql1 = commands.shop.cms.updateGood(...this.modified(param));
        let args1 = [param.shopId, param.foodId];
        sqlParamsEntity.push(this._getNewSqlParamEntity(sql1, args1));

        let sql2 = commands.shop.cms.reduceGoodNum(param.inventory);
        let args2 = [param.foodId];
        sqlParamsEntity.push(this._getNewSqlParamEntity(sql2, args2));

        this.operationArgs(commands.goods.cms.readOne, [param.foodId]).then(val => {
            if (parseInt(val[0].inventory) >= parseInt(param.inventory)) {
                this.operationAffair(sqlParamsEntity).then(() => {
                    connection.queryReturn(res, {
                        status: 1,
                        msg: '更新成功'
                    });
                }).catch(err => connection.queryReturn(res, {
                    status: 0,
                    msg: '更新失败'
                }))
            } else {
                connection.queryReturn(res, {
                    status: 0,
                    msg: '库存不足'
                });
            }
        }).catch(err => console.log(err))
    }
    /**
     * 检查商店名是否重复
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    checkName(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.shop.cms.checkName, [param.name]).then(val => {
            connection.queryReturn(res, {
                status: 1,
                data: val[0]['COUNT(id)'],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 查询一个商店信息
     */
    readOne(req, res, next) {
        const baseUrl = req.protocol + '://' + req.headers.host;
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.shop.cms.readOne, [param.shopId]).then(val => {
            val[0].image = baseUrl + val[0].image;
            connection.queryReturn(res, {
                status: 1,
                data: val[0],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))

    }
    /**
     * 店铺评价
     */
    ratings(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.shop.cms.shopEval, [param.shopId]).then(result => {
            connection.queryReturn(res, {
                status: 1,
                result,
                msg: '查询成功'
            })
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '查询失败'
            })
        })
    }
    qrCode(req, res, next) {
        let params = url.parse(req.url, true);
        let detailLink = params.query.detailLink;
        try {
            let img = qr.image(detailLink, {
                size: 10
            });
            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            img.pipe(res);
        } catch (e) {
            res.writeHead(414, {
                'Content-Type': 'text/html'
            });
            res.end('<h1>414 Request-URI Too Large</h1>');
        }
    }
    /**
     * 查询部分商店信息
     */
    readPart(req, res, next) {
        let param = req.body || req.query || req.params;
        let total = null;
        this.operation(commands.shop.cms.readAllNum(param.name)).then(val => {
            return Promise.all([this.operationArgs(commands.shop.cms.readPart(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
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
     * 模糊搜索商品信息
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    fuzzyHunt(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operation(commands.shop.cms.fuzzyHunt(param.keyword)).then(val => {
            const list = val.length > 0 ? val.map(item => {
                let text = null;
                switch (item.status) {
                    case 0:
                        text = '维修中';
                        break;
                    case 1:
                        text = '营业中';
                        break;
                    case 2:
                        text = '休息中';
                        break;
                    case 3:
                        text = '已关闭';
                        break;
                }
                return {
                    value: item.id,
                    label: item.name,
                    status: text
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
     * 读取商品信息
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readGoods(req, res, next) {
        let param = req.body || req.query || req.params;
        let total = null;
        this.operationArgs(commands.shop.cms.readGoodsNum, [param.shopId]).then(val => {
            return Promise.all([this.operationArgs(commands.shop.cms.readGoods(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
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
     * 改变接受值的类型
     * @param {Object} param 
     */
    modified(param) {
        let key = [],
            val = [];
        for (let i in param) {
            if (i === 'id') {
                delete param[i];
            } else if (i === 'area') {
                key.push(i);
                val.push('"' + param[i].join('/') + '"');
            } else if (typeof param[i] === 'string') {
                key.push(i);
                val.push('"' + param[i] + '"');
            } else {
                key.push(i);
                val.push(param[i]);
            }
        }
        return [key, val];
    }
    /**
     * 新建商店
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    create(req, res, next) {
        let param = req.body || req.query || req.params;

        param['creatTime'] = new Date().getTime();
        if (param.image.length > 0) {
            param.image = param.image.map(cur => cur.url).filter(cur => cur.length > 0).join(";");
        }
        if (param.id) {
            this.update(req, res, next);
        } else {

            this.operation(commands.shop.cms.create(...this.modified(param))).then(() => {
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
     * 更新商店类型
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    update(req, res, next) {
        let param = req.body || req.query || req.params;
        let shopId = param.id;
        this.operationArgs(commands.shop.cms.update(...this.modified(param)), [shopId]).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 更新商店状态
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    remove(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.shop.cms.remove, [param.status, param.id]).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 上传商店图片
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    upload(req, res, next) {
        //Creates a new incoming form.
        const form = new formidable.IncomingForm();
        //服务器地址
        const baseUrl = req.headers.host;
        //设置文件上传存放地址
        form.uploadDir = path.normalize(__dirname + '/../public/pic/shop');
        //执行里面的回调函数的时候，表单已经全部接收完毕了。
        form.parse(req, (err, fields, files) => {
            //使用第三方模块silly-datetime
            const t = sd.format(new Date(), 'YYYYMMDDHHmmss');
            //生成随机数
            const ran = parseInt(Math.random() * 8999 + 10000);
            //拿到扩展名
            const extname = path.extname(files.file.name);
            //旧的路径
            const oldpath = files.file.path;
            //新的路径
            const newpath = __dirname + '/../public/pic/shop/' + t + ran + extname;
            //改名
            fs.rename(oldpath, newpath, err => {
                if (err) {
                    res.send({
                        status: 0,
                        msg: '上传失败'
                    })
                } else res.send({
                    status: 1,
                    url: '/pic/shop/' + t + ran + extname,
                    msg: '上传成功'
                });
            });
        });
    }
    /**
     * 商店销售排名
     */
    sales(req, res, next) {
        let param = req.query;
        this.operation(commands.shop.cms.sales).then(data => {
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

module.exports = new Shop();