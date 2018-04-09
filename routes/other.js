const express = require('express');
const router = express.Router();
const http = require('http');
const connection = require('../common/connection');
//http://ustbhuangyi.com/sell/api/goods
/* GET home page. */
router.get('/goods', function (req, res, next) {
    // 向服务端发送请求
    let _this = res;
    http.get('http://ustbhuangyi.com/sell/api/goods', res => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });
        res.on("end", () => {
            connection.queryReturn(_this, JSON.parse(data));
        })
        res.on("error", (e) => {
            connection.queryReturn(_this, e.message);
        })
    })
});

module.exports = router;