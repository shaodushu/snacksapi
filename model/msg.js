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
class Msg {
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
    addMsg(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.msg.add, [param.createTime, param.content, param.status]).then(data => {
            connection.queryReturn(res, {
                status: 1,
                msg: '添加成功'
            })
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '添加失败'
            })
        })
    }
    selectMsg(req, res, next) {
        let param = req.query;
        let total = null;
        this.operation(commands.msg.readAllNum(param.name)).then(val => {
            return Promise.all([this.operationArgs(commands.msg.select(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
        }).then(([data, total]) => {
            connection.queryReturn(res, {
                status: 1,
                data,
                total,
                msg: '查询成功'
            });
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '查询失败'
            })
        })
    }
    updateMsg(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.msg.update, [param.status, param.id]).then(data => {
            connection.queryReturn(res, {
                status: 1,
                msg: '更新成功'
            })
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '更新失败'
            })
        })
    }
}
module.exports = new Msg();