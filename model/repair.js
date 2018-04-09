const connection = require('../common/connection');
const commands = require('../common/commands');
const security = require('../utils/security');
/**
 * 维修人员Action
 */
class Repair {
    addRepair(req, res, next) {
        // 获取前台页面传过来的参数
        let param = req.query || req.params;
        // 执行Query
        connection.queryArgs(commands.repair.insert, [param.account, security.getSha1(param.pwd)],
            (err, result) => {
                //debugger
                if (!err) {
                    result = {
                        code: 200,
                        data: result,
                        msg: 'successful'
                    };
                }
                // 以json形式，把操作结果返回给前台页面
                connection.queryReturn(res, result);
            }
        );
    }
    
}

module.exports = new Repair();