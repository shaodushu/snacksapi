
const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");
/**
 * 区域类Action
 */
class Area {
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
     * 检查区域名是否重复
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    checkName(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.area.cms.checkName, [param.name]).then(val => {
            connection.queryReturn(res, {
                status: 1,
                data: val[0]['COUNT(id)'],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 查询一个区域名
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readOne(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.area.cms.readOne, [param.areaId]).then(val => {
            delete val[0].oldPrice;
            connection.queryReturn(res, {
                status: 1,
                data: val[0],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 查询部分部分区域名
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readPart(req, res, next) {
        // 判断信息来源
        let type = req.path === '/cms/area/readPart';
        let param = req.body || req.query || req.params;
        let total = null;
        if (type) {
            this.operation(commands.area.cms.readAllNum).then(val => {
                return Promise.all([this.operationArgs(commands.area.cms.readPart(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
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
     * 改变读取数据类型
     * @param {Object} param 
     */
    modified(param) {
        let key = [], val = [];
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
     * 新建区域
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    create(req, res, next) {
        let param = req.body || req.query || req.params;
        if (param.image.length > 0) {
            param.image = param.image.map(cur => cur.url).join(";");
        }
        if (param.id) {
            this.update(req, res, next);
        } else {
            this.operation(commands.area.cms.create(...this.modified(param))).then(() => {
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
     * 更新区域数据
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    update(req, res, next) {
        let param = req.body || req.query || req.params;
        let areaId = param.id;
        this.operationArgs(commands.area.cms.replace, [areaId]).then(() => {
            return this.operationArgs(commands.area.cms.update(...this.modified(param)), [areaId]);
        }).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
    /**
     * 改变区域状态 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    remove(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.area.cms.remove, [param.status,param.id]).then(() => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            });
        }).catch(err => console.log(err));
    }
}

module.exports = new Area();