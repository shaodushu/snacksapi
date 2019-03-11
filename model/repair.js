const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");
/**
 * 运维人员类Action
 */
class Repair {
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
     * 查询一个运维人员名
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readOne(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.repair.cms.readOne, [param.repairId]).then(val => {
            connection.queryReturn(res, {
                status: 1,
                data: val[0],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 模糊搜索运维人员信息
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    fuzzyHunt(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operation(commands.repair.cms.fuzzyHunt(param.keyword)).then(val => {
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
     * 查询部分部分运维人员名
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readPart(req, res, next) {
        // 判断信息来源
        let type = req.path === '/cms/repair/readPart';
        let param = req.body || req.query || req.params;

        let total = null;
        if (type) {
            this.operation(commands.repair.cms.readAllNum(param.name)).then(val => {
                return Promise.all([this.operationArgs(commands.repair.cms.readPart(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(number)']]);
            }).then(([result, total]) => {
                connection.queryReturn(res, {
                    status: 1,
                    data: result,
                    total: total,
                    msg: '查询成功'
                });
            }).catch(err => console.log(err))
        }
    }
    /**
     * 查询商店信息
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readShop(req, res, next) {
        let param = req.body || req.query || req.params;
        let total = null;
        this.operationArgs(commands.repair.cms.readShopNum, [param.repairId]).then(val => {
            return Promise.all([this.operationArgs(commands.repair.cms.readShop(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
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
     * 运维添加商店
     * 采用事务
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    addShop(req, res, next) {
        let param = req.body || req.query || req.params;
        param['creatTime'] = new Date().getTime();
        let sqlParamsEntity = [];

        let sql1 = commands.repair.cms.createShop(...this.modified(param));
        sqlParamsEntity.push(this._getNewSqlParamEntity(sql1));

        let sql2 = commands.repair.cms.updateShop(1);
        let args2 = [param.shopId];
        sqlParamsEntity.push(this._getNewSqlParamEntity(sql2, args2));

        this.operationArgs(commands.repair.cms.hasThisShop, [param.repairId, param.shopId]).then(cur => {
            if (cur[0]['COUNT(id)'] > 0) {
                connection.queryReturn(res, {
                    status: 0,
                    msg: '已被添加，请勿重复操作'
                })

            } else {
                this.operationAffair(sqlParamsEntity).then(() => {
                    connection.queryReturn(res, {
                        status: 1,
                        msg: '添加成功'
                    });
                }).catch(err => connection.queryReturn(res, {
                    status: 0,
                    msg: '添加失败'
                }))
            }
        }).catch(err => {
            console.log(err)
        })

    }
    /**
     * 运维删除商店
     * 采用事务
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    delShop(req, res, next) {
        let param = req.body || req.query || req.params;
        param['creatTime'] = new Date().getTime();
        let sqlParamsEntity = [];

        let sql1 = commands.repair.cms.deleteShop;
        let args1 = [param.id]
        sqlParamsEntity.push(this._getNewSqlParamEntity(sql1, args1));

        let sql2 = commands.repair.cms.updateShop(0);
        let args2 = [param.shopId];
        sqlParamsEntity.push(this._getNewSqlParamEntity(sql2, args2));

        this.operationAffair(sqlParamsEntity).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '删除成功'
            });
        }).catch(err => connection.queryReturn(res, {
            status: 0,
            msg: '删除失败'
        }))
    }
    /**
     * 改变读取数据类型
     * @param {Object} param 
     */
    modified(param) {
        let key = [],
            val = [];
        for (let i in param) {
            if (i === 'number') {
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
     * 新建运维人员
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    create(req, res, next) {
        let param = req.body || req.query || req.params;
        if (param.number) {
            this.update(req, res, next);
        } else {
            let sqlParamsEntity = [];

            let sql1 = commands.repair.cms.create(...this.modified(param));
            sqlParamsEntity.push(this._getNewSqlParamEntity(sql1));

            let sql2 = commands.login.createRepair;
            sqlParamsEntity.push(this._getNewSqlParamEntity(sql2));

            this.operationAffair(sqlParamsEntity).then(() => {
                connection.queryReturn(res, {
                    status: 1,
                    msg: '添加成功'
                });
            }).catch(err => connection.queryReturn(res, {
                status: 0,
                msg: '添加失败'
            }))
        }

    }
    /**
     * 更新运维人员数据
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    update(req, res, next) {
        let param = req.body || req.query || req.params;
        let repairId = param.number;
        this.operationArgs(commands.repair.cms.update(...this.modified(param)), [repairId]).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(() => {
            connection.queryReturn(res, {
                status: 0,
                msg: '更新失败'
            })
        });
    }
    /**
     * 改变运维人员状态 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    remove(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.repair.cms.remove, [param.status, param.id]).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 上传运维人员图片
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
        form.uploadDir = path.normalize(__dirname + '/../public/pic/repair');
        //执行里面的回调函数的时候，表单已经全部接收完毕了。
        form.parse(req, (err, fields, files) => {
            //使用第三方模块silly-datetime
            const t = sd.format(new Date(), 'YYYYMMDDHHmmss');
            //生成随机数
            const ran = parseInt(Math.random() * 8999 + 10000);
            const extname = path.extname(files.file.name);
            const oldpath = files.file.path;
            const newpath = __dirname + '/../public/pic/repair/' + t + ran + extname;
            //改名
            fs.rename(oldpath, newpath, err => {
                if (err) {
                    res.send({
                        status: 0,
                        msg: '上传失败'
                    })
                } else res.send({
                    status: 1,
                    url: '/pic/repair/' + t + ran + extname,
                    msg: '上传成功'
                });
            });
        });
    }
}

module.exports = new Repair();