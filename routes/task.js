const express = require('express');
const router = express.Router();

const Task = require('../model/task');

router.get('/v1/task', function (req, res, next) {
    Task.selectTask(req, res, next);
});
router.put('/v1/task', function (req, res, next) {
    Task.updateTask(req, res, next);
});
router.post('/v1/task', function (req, res, next) {
    Task.addTask(req, res, next);
});


module.exports = router;
