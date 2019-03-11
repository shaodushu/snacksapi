const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");
/**
 * 订单类Action
 */
class Order {
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
     * 查询部分订单
     */
    readPart(req, res, next) {
        let param = req.body || req.query || req.params;
        let total = null;
        this.operation(commands.order.readAllNum(param.name)).then(val => {
            return Promise.all([this.operationArgs(commands.order.readPart(param), [(param.page - 1) * param.size, param.page * param.size]), val[0]['COUNT(id)']]);
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
module.exports = new Order();