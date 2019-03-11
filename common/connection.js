const mysql = require("mysql");
const db = require("../config/db");
const async = require('async');
const pool = mysql.createPool(db.mysql);


class Connection {
    /**
     * 事务操作
     * @param {*} sqlparamsEntities 
     * @param {*} callback 
     */
    execTrans(sqlparamsEntities, callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                return callback(err, null);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    return callback(err, null);
                }
                console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
                var funcAry = [];
                sqlparamsEntities.forEach(function (sql_param) {
                    var temp = function (cb) {
                        var sql = sql_param.sql;
                        var param = sql_param.params;
                        connection.query(sql, param, function (tErr, rows, fields) {
                            if (tErr) {
                                connection.rollback(function () {
                                    console.log("事务失败，" + JSON.parse(JSON.stringify(sql_param)) + "，ERROR：" + tErr);
                                    throw tErr;
                                });
                            } else {
                                return cb(null, 'ok');
                            }
                        })
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    console.log("transaction error: " + err);
                    if (err) {
                        connection.rollback(function (err) {
                            console.log("transaction error: " + err);
                            connection.release();
                            return callback(err, null);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            console.log("transaction info: " + JSON.stringify(info));
                            if (err) {
                                console.log("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    console.log("transaction error: " + err);
                                    connection.release();
                                    return callback(err, null);
                                });
                            } else {
                                connection.release();
                                return callback(null, info);
                            }
                        })
                    }
                })
            });
        });
    }
    /**
     * 对query执行的结果自定义返回JSON结果
     * @param {*} res 
     * @param {String} result 
     * @param {*} resultJSON 
     */
    queryReturn(res, result, resultJSON) {
        if (typeof result === 'undefined') {
            res.json({
                code: '201',
                msg: 'failed to do'
            });
        } else res.json(result);
    }
    /**
     * 封装query之sql带不占位符func
     * @param {*} sql 
     * @param {*} callback 
     */
    query(sql, callback) {
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows) {
                callback(err, rows);
                //释放链接
                connection.release();
            });
        });
    }
    /**
     * 封装query之sql带占位符func
     * @param {*} sql 
     * @param {*} args 
     * @param {*} callback 
     */
    queryArgs(sql, args, callback) {
        pool.getConnection(function (err, connection) {
            connection.query(sql, args, function (err, rows) {
                callback(err, rows);
                //释放链接
                connection.release();
            });
        });
    }
}

module.exports = new Connection();