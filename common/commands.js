

const repair = {
    queryAll: 'select * from repair',
    insert: 'INSERT INTO repair(account, pwd) VALUES(?,?)',
}
const login = {
    userAuth: 'select * from permissions WHERE account=? AND pwd=?',
    replace: 'UPDATE permissions SET lastLoginTime=loginTime,lastLoginArea=loginArea  WHERE id=?',
    update: 'UPDATE permissions SET loginTime=?, loginArea=?  WHERE id=?',
    adminInfo: 'select * from admin WHERE id=?'
}
const goods = {
    cms: {
        checkName:'SELECT COUNT(id) FROM foods WHERE name=?',
        readAllNum:'SELECT COUNT(id) FROM foods ',
        readOne:'SELECT * FROM foods WHERE id=?',
        /**
         * 
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.pdtTime) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name="' + obj.name + '"';
                } else if (obj.pdtTime) {
                    base = ' AND ' + base + 'pdtTime=' + obj.pdtTime;
                }
            }
            return 'select * from foods ' + base + ' limit ?,?'
        },
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        create(key,val){
            return 'INSERT INTO foods ('+key+') VALUES ('+val+')';
        },
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key,val){
            let base=key.map((cur,index)=>{
                return cur+'='+val[index];
            }).join(',');
            return  'UPDATE foods SET '+base+'  WHERE id=?';
        },
        remove:'UPDATE foods SET status=?  WHERE id=?',
        replace:'UPDATE foods SET oldPrice=price  WHERE id=?',
    }
}
const shop = {
    cms: {
        checkName:'SELECT COUNT(id) FROM shop WHERE name=?',
        readAllNum:'SELECT COUNT(id) FROM shop ',
        readGoodsNum:'SELECT COUNT(id) FROM shop_foods WHERE id=?',
        readOne:'SELECT * FROM shop WHERE id=?',
        /**
         * 分页读取商店信息-sql
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name="' + obj.name + '"';
                } else if (obj.status) {
                    base = ' AND ' + base + 'status=' + obj.status;
                }
            }
            return 'select * from shop ' + base + ' limit ?,?';
        },
        /**
         * 分页读取商店商品信息-sql
         * @param {Object} obj 
         */
        readGoods(obj){
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name="' + obj.name + '"';
                } else if (obj.status) {
                    base = ' AND ' + base + 'status=' + obj.status;
                }
            }
            return 'select * from shop_foods ' + base + ' limit ?,?';
        },
        /**
         * 创建商店信息-sql
         * @param {Array} key 
         * @param {Array} val 
         */
        create(key,val){
            return 'INSERT INTO shop ('+key+') VALUES ('+val+')';
        },
        /**
         * 更新商店信息-sql
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key,val){
            let base=key.map((cur,index)=>{
                return cur+'='+val[index];
            }).join(',');
            return  'UPDATE shop SET '+base+'  WHERE id=?';
        },
        remove:'UPDATE shop SET status=?  WHERE id=?',
    }
}
const area = {
    cms: {
        checkName:'SELECT COUNT(id) FROM area WHERE name=?',
        readAllNum:'SELECT COUNT(id) FROM area ',
        readOne:'SELECT * FROM area WHERE id=?',
        /**
         * 
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name="' + obj.name + '"';
                } else if (obj.status) {
                    base = ' AND ' + base + 'status=' + obj.status;
                }
            }
            return 'select * from area ' + base + ' limit ?,?'
        },
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        create(key,val){
            return 'INSERT INTO area ('+key+') VALUES ('+val+')';
        },
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key,val){
            let base=key.map((cur,index)=>{
                return cur+'='+val[index];
            }).join(',');
            return  'UPDATE area SET '+base+'  WHERE id=?';
        },
        remove:'UPDATE area SET status=?  WHERE id=?',
    }
}
//exports
module.exports = {
    repair,
    login,
    goods,
    shop,
    area
};
