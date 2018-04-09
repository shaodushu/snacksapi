
const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
const fs = require('fs');
const formidable = require('formidable');
const path = require("path");
const sd = require("silly-datetime");
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
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readOne(req, res, next) {
        let param = req.body || req.query || req.params;
        this.operationArgs(commands.shop.cms.readOne, [param.shopId]).then(val => {
            //delete val[0].oldPrice;
            connection.queryReturn(res, {
                status: 1,
                data: val[0],
                msg: '查询成功'
            });
        }).catch(err => console.log(err))
    }
    /**
     * 查询部分商店信息
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    readPart(req, res, next) {
        let param = req.body || req.query || req.params;
        let total = null;
        this.operation(commands.shop.cms.readAllNum).then(val => {
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
     * 改变接受值的类型
     * @param {Object} param 
     */
    modified(param) {
        let key = [], val = [];
        for (let i in param) {
            if (i === 'id') {
                delete param[i];
            } else if (i === 'area') {
                key.push(i);
                val.push('"' +param[i].join('/')+ '"');
            } else if (typeof param[i] === 'string') {
                key.push(i);
                val.push('"' + param[i] + '"');
            } else{
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

        param['creatTime']=new Date().getTime();
        if (param.image.length > 0) {
            param.image = param.image.map(cur => cur.url).join(";");
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
        this.operationArgs(commands.shop.cms.remove, [param.status,param.id]).then(() => {
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
                    url: 'http://' + baseUrl + '/pic/shop/' + t + ran + extname,
                    msg: '上传成功'
                });
            });
        });
    }
}

module.exports = new Shop();