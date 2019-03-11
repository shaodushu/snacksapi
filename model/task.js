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
class Task {
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
    addTask(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.task.add, [param.createTime, param.content, param.status]).then(data => {
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
    selectTask(req, res, next){
        let param = req.body || req.query || req.params;
        this.operation(commands.task.select).then(data => {
            connection.queryReturn(res, {
                status: 1,
                data,
                msg: '查询成功'
            })
        }).catch(err => {
            connection.queryReturn(res, {
                status: 0,
                msg: '查询失败'
            })
        })
    }
    updateTask(req, res, next){
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.task.update,[param.status,param.id]).then(data => {
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
module.exports = new Task();