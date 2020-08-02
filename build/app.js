"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _httpErrors = _interopRequireDefault(require("http-errors"));

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _expressIpBlock = _interopRequireDefault(require("express-ip-block"));

var _expressTimeoutHandler = _interopRequireDefault(require("express-timeout-handler"));

var _helmet = _interopRequireDefault(require("helmet"));

var _compression = _interopRequireDefault(require("compression"));

var _connectFlash = _interopRequireDefault(require("connect-flash"));

var _socket = _interopRequireDefault(require("socket.io"));

var _socket2 = _interopRequireDefault(require("./socket"));

require("./env");

require("./db");

var _ips = require("./server/models/ips");

var _middleware = require("./middleware");

var _index = _interopRequireDefault(require("./server/routes/index"));

var _user = _interopRequireDefault(require("./server/routes/user"));

var _community = _interopRequireDefault(require("./server/routes/community"));

var _message = _interopRequireDefault(require("./server/routes/message"));

var _cheat = _interopRequireDefault(require("./server/routes/cheat"));

var _admin = _interopRequireDefault(require("./server/routes/admin"));

var _sriracha = _interopRequireDefault(require("sriracha"));

var MongoStore = require("connect-mongo")(_expressSession["default"]);

var adminOpt = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
};
var app = (0, _express["default"])(); // view engine setup

app.set("views", _path["default"].join(__dirname, "server/views"));
app.set("view engine", "ejs"); // Security
// time-out-handle

app.use(_middleware.timeoutModule); //  D-Dos block

app.use(_middleware.rateLimitModule); // helmet

app.use((0, _helmet["default"])()); // ip block

(0, _ips.getBannedIps)();
app.use((0, _expressIpBlock["default"])(_ips.bannedIps, {
  allow: false,
  allowForwarded: true
}), _expressTimeoutHandler["default"].set(5000), function (req, res, next) {
  next();
});
app.use((0, _morgan["default"])(process.env.DEBUG == "true" ? "dev" : "common"));
app.use((0, _compression["default"])());
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use(_bodyParser["default"].urlencoded({
  extended: false
}));
app.use((0, _cookieParser["default"])(process.env.SESSION_SECRET));
app.use((0, _expressSession["default"])({
  key: process.env.SESSION_KEY,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: process.env.DB,
    collection: "sessions"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60,
    // 쿠키 유효기간 1시간
    httpOnly: true
  }
}));
app.use((0, _connectFlash["default"])());
app.use(_express["default"]["static"](_path["default"].join(__dirname, "public"), {
  maxAge: process.env.DEBUG == "true" ? 0 : 1000 * 60 * 60
})); // URL Pattern

app.use("/", _index["default"]);
app.use("/users", _user["default"]);
app.use("/communities", _community["default"]);
app.use("/messages", _message["default"]);
app.use("/cheat", _cheat["default"]);
app.use("/admin", _admin["default"]);
app.use("/express-admin", function (req, res, next) {
  req.session.destroy();
  next();
}, (0, _sriracha["default"])(adminOpt)); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next((0, _httpErrors["default"])(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.DEBUG == "true" ? err : {}; // render the error page

  res.status(err.status || 500).render("error/error");
});
app.set("port", process.env.PORT || process.env.PORT);
var server = app.listen(app.get("port"), function () {
  console.log("SERVER START AT http://localhost:".concat(server.address().port, "/"));
});
var io = (0, _socket["default"])(server);
(0, _socket2["default"])(io);
module.exports = app;