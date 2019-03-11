const msg = {
    add: 'INSERT INTO message (createTime,content,`status`) VALUES(?,?,?)',
    selectAll: "SELECT * FROM message",
    update: "UPDATE message SET status=? WHERE id=?",
     /**
     * 分页读取订单信息-sql
     * @param {Object} obj 
     */
    select(obj) {
        let base = '';
        if (obj.name) {
            base = base + 'where ';
            if (obj.name) {
                base = base + 'foodName LIKE"' + obj.name + '%"';
            }
        }
        return 'select * from message ' + base + ' limit ?,?';
    },
    readAllNum(keyword) {
        if (keyword) {
            return 'SELECT COUNT(id) FROM message WHERE foodName LIKE "' + keyword + '%" '
        } else return 'SELECT COUNT(id) FROM message '
    },
}
const task = {
    add: 'INSERT INTO task (createTime,content,`status`) VALUES(?,?,?)',
    select: "SELECT * FROM task",
    update: "UPDATE task SET status=? WHERE id=?",
}
const order = {
    /**
     * 创建订单-sql
     * @param {Array} key 
     * @param {Array} val 
     */
    create(key, val) {
        return 'INSERT INTO `order`  (' + key + ') VALUES (' + val + ')';
    },
    /**
     * 创建order_foods
     * issue 取order最后一条为用户最新操作
     * @param {*} foodId 
     * @param {*} foodName 
     * @param {*} foodCount 
     */
    contactFood(foodId, foodName, foodCount) {
        return 'INSERT INTO order_foods (orderId,foodsId,foodName,foodCount) VALUES((select id from `order` order by id DESC limit 1),' + foodId + ',"' + foodName + '",' + foodCount + ')'
    },
    /**
     * 获取用户订单
     * @param {*} userId 
     */
    gain(userId) {
        return 'SELECT * FROM `order`  WHERE userId=' + userId+' ORDER BY creatTime DESC'
    },
    /**
     * 获取关联商店
     * @param {*} shopId 
     */
    getContactShop(shopId) {
        return 'SELECT * FROM shop WHERE id=' + shopId
    },
    /**
     * 获取关联食物
     * @param {*} orderId 
     */
    getContactFood(orderId) {
        return 'SELECT * FROM order_foods WHERE orderId=' + orderId
    },
    isUpdateUserMoney(userId, money) {
        return 'SELECT * FROM `user` WHERE id=' + userId + ' AND money-' + money + '>0'
    },
    updateUserMoney(userId, money) {
        return 'UPDATE `user` SET money=money-' + money + ' WHERE id=' + userId + ' AND money-' + money + '>0'
    },
    /**
     * 更新订单评价
     * @param {*} orderId 
     * @param {*} status 
     */
    updateOrderEval(orderId, status) {
        return 'UPDATE `order` SET eval=' + status + ' WHERE id=' + orderId
    },
    /**
     * 创建食物评价
     */
    createFoodsEval(foodId, userId, shopId, score, rateTime) {
        return 'INSERT INTO foods_evaluate  (foodId,userId,shopId,score,rateTime) VALUES (' + foodId + ',' + userId + ',' + shopId + ',' + score + ',' + rateTime + ')';
    },
    /**
     * 创建商铺评价
     */
    createShopEval(shopId, userId, score, text, rateTime) {
        return 'INSERT INTO shop_evaluate  (shopId,userId,score,text,rateTime) VALUES (' + shopId + ',' + userId + ',' + score + ',"' + text + '",' + rateTime + ')';
    },
    readAllNum(keyword) {
        if (keyword) {
            return 'SELECT COUNT(id) FROM `order` WHERE name LIKE "' + keyword + '%" '
        } else return 'SELECT COUNT(id) FROM `order` '
    },

    /**
     * 分页读取订单信息-sql
     * @param {Object} obj 
     */
    readPart(obj) {
        let base = '';
        if (obj.name) {
            base = base + 'where ';
            if (obj.name) {
                base = base + 'name LIKE"' + obj.name + '%"';
            }
        }
        return 'select * from `order` ' + base + ' limit ?,?';
    },

}
const repair = {
    cms: {
        /**
         * 创建维修人员
         * @param {Array} key 
         * @param {Array} val 
         */
        create(key, val) {
            return 'INSERT INTO repair (' + key + ') VALUES (' + val + ')';
        },
        readAllNum(keyword) {
            if (keyword) {
                return 'SELECT COUNT(number) FROM repair WHERE name LIKE "' + keyword + '%" '
            } else return 'SELECT COUNT(number) FROM repair '

        },
        readShopNum: 'SELECT COUNT(id) FROM repair_shop WHERE repairId=?',
        /**
         * 
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.creatTime) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name LIKE"' + obj.name + '%"';
                } else if (obj.creatTime) {
                    base = ' AND ' + base + 'creatTime=' + obj.creatTime;
                }
            }
            return 'select * from repair ' + base + ' limit ?,?'
        },
        /**
         * 创建运维-商店信息-sql
         * @param {Array} key 
         * @param {Array} val 
         */
        createShop(key, val) {
            return 'INSERT INTO repair_shop (' + key + ') VALUES (' + val + ')';
        },
        hasThisShop: 'SELECT COUNT(id) FROM repair_shop WHERE repairId=? AND shopId=?',
        /**
         * 更新商店运维状态
         * @param {Number} status
         */
        updateShop(status) {
            return 'UPDATE shop SET hasRepair=' + status + ' WHERE id=?';
        },
        /**
         * 分页读取运维管理的商店信息-sql
         * @param {Object} obj 
         */
        readShop(obj) {
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'shopName="' + obj.name + '"';
                } else if (obj.status) {
                    base = ' AND ' + base + 'status=' + obj.status;
                }
            }
            return 'select * from repair_shop ' + base + ' limit ?,?';
        },
        readOne: 'SELECT * FROM repair WHERE number=?',
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key, val) {
            let base = key.map((cur, index) => {
                return cur + '=' + val[index];
            }).join(',');
            return 'UPDATE repair SET ' + base + '  WHERE number=?';
        },
        /**
         * 删除运维-商店信息-sql
         */
        deleteShop: 'DELETE FROM repair_shop WHERE id=?',
    }
}
const login = {
    userAuth: 'select * from permissions WHERE account=? AND pwd=?',
    replace: 'UPDATE permissions SET lastLoginTime=loginTime,lastLoginArea=loginArea  WHERE id=?',
    update: 'UPDATE permissions SET loginTime=?, loginArea=?  WHERE id=?',
    adminInfo: 'select * from admin WHERE id=?',
    repairInfo: 'select * from repair WHERE number=?',
    createRepair: 'INSERT INTO permissions (account,handleId)(SELECT number,number FROM REPAIR ORDER BY number DESC LIMIT 1)'
}
const goods = {
    cms: {
        sales:'SELECT name,count(*) FROM foods,order_foods WHERE foods.id=order_foods.foodsId GROUP BY foodsId',
        checkName: 'SELECT COUNT(id) FROM foods WHERE name=?',
        readAllNum(keyword) {
            if (keyword) {
                return 'SELECT COUNT(id) FROM foods WHERE name LIKE "' + keyword + '%" '
            } else return 'SELECT COUNT(id) FROM foods '

        },
        readOne: 'SELECT * FROM foods WHERE id=?',
        fuzzyHunt(keyword) {
            return 'SELECT * FROM foods WHERE name like "' + keyword + '%" '
        },
        /**
         * 
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.pdtTime) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name LIKE"' + obj.name + '%"';
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
        create(key, val) {
            return 'INSERT INTO foods (' + key + ') VALUES (' + val + ')';
        },
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key, val) {
            let base = key.map((cur, index) => {
                return cur + '=' + val[index];
            }).join(',');
            return 'UPDATE foods SET ' + base + '  WHERE id=?';
        },
        remove: 'UPDATE foods SET status=?  WHERE id=?',
        replace: 'UPDATE foods SET oldPrice=price  WHERE id=?',
    },
    client: {
        getFood(shopId) {
            return 'SELECT * FROM shop_foods WHERE shopId=' + shopId
        },
        updateFood(shopId, foodId, reduce) {
            return 'SELECT * FROM shop_foods WHERE shopId=' + shopId + ' AND foodId=' + foodId + ' AND inventory=inventory-' + reduce;
        },
        getFoodId(shopId) {
            return 'SELECT foodId FROM shop_foods WHERE shopId=' + shopId + ' AND inventory>0'
        },
        /**
         * 
         * @param {Array} foodId
         */
        getFoodInfo(foodId) {
            return 'SELECT * FROM foods WHERE id in (' + foodId + ')'
        },
        getFoodEval(shopId, foodId) {
            return 'SELECT * from foods_evaluate WHERE shopId=' + shopId + ' AND foodId=' + foodId
        },
        /**
         * 获取食物销售量
         */
        getFoodSales: `SELECT
                        foodsId "foodId",
                        SUM(foodCount) AS foodCount
                    FROM
                        order_foods
                    GROUP BY
                        foodsId`,
        /**
         *获取商店食物评价 
         */
        getShopFoodEval: `SELECT
                        foodId,
                        SUM(score) AS score,
                        count(*)
                    FROM
                        foods_evaluate
                    WHERE shopId=?
                    GROUP BY
                        foodId`

    }
}
const shop = {
    cms: {
        sales:'SELECT name,count(*) FROM shop,`order` WHERE shop.id=`order`.shopId GROUP BY shopId',
        checkName: 'SELECT COUNT(id) FROM shop WHERE name=?',
        readAllNum(keyword) {
            if (keyword) {
                return 'SELECT COUNT(id) FROM shop WHERE name LIKE "' + keyword + '%" '
            } else return 'SELECT COUNT(id) FROM shop'

        },
        fuzzyHunt(keyword) {
            return 'SELECT * FROM shop WHERE name like "' + keyword + '%" AND hasRepair=0'
        },
        readGoodsNum: 'SELECT COUNT(id) FROM shop_foods WHERE shopId=?',
        hasThisGood: 'SELECT COUNT(id) FROM shop_foods WHERE shopId=? AND foodId=?',
        readOne: 'SELECT * FROM shop WHERE id=?',
        /**
         * 商铺评价
         */
        shopEval: 'SELECT `user`.`name`,shop_evaluate.score,shop_evaluate.text,shop_evaluate.rateTime FROM `user`,shop_evaluate WHERE `user`.id = shop_evaluate.userId AND shop_evaluate.shopId = ?',
        /**
         * 分页读取商店信息-sql
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name LIKE"' + obj.name + '%"';
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
        readGoods(obj) {
            let base = '';
            if (obj.name || obj.shopId) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name LIKE"' + obj.name + '%"  AND ';
                } else if (obj.shopId) {
                    base = base + 'shopId=' + obj.shopId;
                }
            }
            return 'select * from shop_foods ' + base + ' limit ?,?';
        },
        /**
         * 创建商店信息-sql
         * @param {Array} key 
         * @param {Array} val 
         */
        create(key, val) {
            return 'INSERT INTO shop (' + key + ') VALUES (' + val + ')';
        },
        /**
         * 更新商店信息-sql
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key, val) {
            let base = key.map((cur, index) => {
                return cur + '=' + val[index];
            }).join(',');
            return 'UPDATE shop SET ' + base + '  WHERE id=?';
        },
        /**
         * 更新商店-商品信息
         * @param {Array} key 
         * @param {Array} val 
         */
        updateGood(key, val) {
            let base = key.map((cur, index) => {
                if (cur === 'shopId' || cur === 'foodId') {
                    return null;
                } else if (cur === 'inventory') {
                    return cur + '=inventory+' + val[index];
                } else return cur + '=' + val[index];
            }).filter(cur => cur !== null).join(',');
            return 'UPDATE shop_foods SET ' + base + '  WHERE shopId=? AND foodId=?';
        },
        /**
         * 创建商店-商品信息-sql
         * @param {Array} key 
         * @param {Array} val 
         */
        createGood(key, val) {
            return 'INSERT INTO shop_foods (' + key + ') VALUES (' + val + ')';
        },
        /**
         * 删除商店-商品信息-sql
         */
        deleteGood: 'DELETE FROM shop_foods WHERE id=?',
        /**
         * 减少商品库存
         * @param {Number} num 
         */
        reduceGoodNum(num) {
            return 'UPDATE foods SET inventory=inventory-' + num + ' WHERE id=?';
        },
        remove: 'UPDATE shop SET status=?  WHERE id=?',
    },
    client: {
        allShop: 'SELECT * FROM shop'
    }
}
const area = {
    cms: {
        checkName: 'SELECT COUNT(id) FROM area WHERE name=?',
        readAllNum(keyword) {
            if (keyword) {
                return 'SELECT COUNT(id) FROM area WHERE name LIKE "' + keyword + '%" '
            } else return 'SELECT COUNT(id) FROM area '

        },
        readOne: 'SELECT * FROM area WHERE id=?',
        /**
         * 
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name LIKE"' + obj.name + '%"';
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
        create(key, val) {
            return 'INSERT INTO area (' + key + ') VALUES (' + val + ')';
        },
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        update(key, val) {
            let base = key.map((cur, index) => {
                return cur + '=' + val[index];
            }).join(',');
            return 'UPDATE area SET ' + base + '  WHERE id=?';
        },
        remove: 'UPDATE area SET status=?  WHERE id=?',
    }
}
const user = {
    cms: {
        readAllNum(keyword) {
            if (keyword) {
                return 'SELECT COUNT(id) FROM `user` WHERE name LIKE "' + keyword + '%" '
            } else return 'SELECT COUNT(id) FROM `user` '
        },
        /**
         * 
         * @param {Object} obj 
         */
        readPart(obj) {
            let base = '';
            if (obj.name || obj.status) {
                base = base + 'where ';
                if (obj.name) {
                    base = base + 'name LIKE"' + obj.name + '%"';
                } else if (obj.status) {
                    base = ' AND ' + base + 'status=' + obj.status;
                }
            }
            return 'select * from `user` ' + base + ' limit ?,?'
        },
    },
    client: {
        isExist: 'SELECT COUNT(id) FROM `user` WHERE discern=?',
        /**
         * 
         * @param {Array} key 
         * @param {Array} val 
         */
        create(key, val) {
            return 'INSERT INTO `user` (' + key + ') VALUES (' + val + ')';
        },
        userinfo: 'SELECT * FROM `user` WHERE discern=?'
    }
}
//exports
module.exports = {
    repair,
    login,
    goods,
    shop,
    area,
    user,
    order,
    task,
    msg
};