const mysql = require("mysql");
const db = require("../config/db");

const pool = mysql.createPool(db.mysql);


class Connection {
    /**
     * 对query执行的结果自定义返回JSON结果
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
     */
    queryArgs(sql, args, callback){
        pool.getConnection(function (err, connection) {
            connection.query(sql, args, function (err, rows) {
                callback(err, rows);
                //释放链接
                connection.release();
            });
        });
    }
}

module.exports =new Connection();