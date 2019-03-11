const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const jwt = require('jsonwebtoken');

/**
 * Action
 */
class Login {
    //获取客户端公网IP 
    getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }
    /**
     * @param sql
     */
    operation(sql, args) {
        return new Promise((resolve, reject) => {
            connection.queryArgs(sql, args, (err, result) => {
                if (!err) {
                    resolve(result);
                } else reject(new Error(err));
            });
        })
    }
    userAuth(req, res, next) {
        // 获取前台页面传过来的参数
        let param = req.body || req.query || req.params;
        
        this.operation(commands.login.userAuth, [param.account, param.pwd]).then(result => {
            
            if (result.length > 0) {
                this.operation(commands.login.replace, [result[0].id]).then(() => {
                    return this.operation(commands.login.update, [Date.now(), this.getClientIp(req), result[0].id]);
                }).then(() => {
                    if(result[0].type===0){
                        return this.operation(commands.login.adminInfo, [result[0].handleId]);
                    }else{
                        return this.operation(commands.login.repairInfo, [result[0].handleId]);
                    }
                    
                }).then(val => {
                    connection.queryReturn(res, {
                        status: 1,
                        data: {
                            type: result[0].type,
                            name: val[0].name,
                            lastTime: result[0].lastLoginTime,
                            lastArea: result[0].lastLoginArea,
                            avator: val[0].image,
                            handleId: result[0].handleId,
                            token: jwt.sign({
                                account: result.account,
                                pwd: result.pwd
                            }, "shaodushu", {
                                expiresIn: 60 * 30
                            })
                        },
                        msg: '登录成功'
                    });
                }).catch(err => {
                    connection.queryReturn(res, {
                        status: 0,
                        data: err,
                        msg: '系统错误'
                    });
                });

            } else {
                connection.queryReturn(res, {
                    status: 0,
                    msg: '账户密码错误'
                });
            }
        }).catch(err => {
            console.log(err)
        })
    }
    clientAuth(req, res, next) {
        let param = req.body || req.query || req.params;
        connection.queryReturn(res, {
            status: 1,
            data: {
                discern: param.fingerprint,
                token: jwt.sign({
                    fingerprint: param.fingerprint,
                }, "shaodushu", {
                    expiresIn: 60 * 60
                })
            },
            msg: '获取权限成功'
        });
    }

}

module.exports = new Login();