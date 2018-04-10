const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressJWT = require('express-jwt');

const index = require('./routes/index');
const login = require('./routes/login');
const goods=require('./routes/goods');
const shop=require('./routes/shop');
const area=require('./routes/area');
const repair = require('./routes/repair');
const other = require('./routes/other');

const app = express();
/**
 * 跨域
 * 只有本地8080可以访问
 */
const corsOptions = {
  origin: 'http://localhost:8080', 
  optionsSuccessStatus: 200
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(cors(corsOptions));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Token设置
app.use(expressJWT({
  secret: "shaodushu"   //加密token 校验token时要使用
}).unless({
  path: ['/api/userAuth','/api/goods']  //除了这个地址，其他的URL都需要验证
}));


app.use('/', index);
app.use('/api', login);
app.use('/api', goods);
app.use('/api', shop);
app.use('/api', area);
app.use('/api', repair);
app.use('/api', other);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// catch 401 and forward to error handler
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      status: 401,
      msg: 'invalid token...'
    });
  }
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render({
    status: 500,
    msg: 'error...'
  });
});

module.exports = app;
