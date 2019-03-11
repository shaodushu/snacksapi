const express = require('express');
const router = express.Router();

const Msg = require('../model/msg');

router.get('/v1/msg', function (req, res, next) {
    Msg.selectMsg(req, res, next);
});
router.put('/v1/msg', function (req, res, next) {
    Msg.updateMsg(req, res, next);
});
router.post('/v1/msg', function (req, res, next) {
    Msg.addMsg(req, res, next);
});


module.exports = router;
