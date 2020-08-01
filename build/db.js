"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _mongoose = _interopRequireDefault(require("mongoose"));

require("./env");

if (process.env.DEBUG == "true") {
  _mongoose["default"].connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
} else {
  _mongoose["default"].connect("mongodb://".concat(process.env.DB_USER, ":").concat(process.env.DB_PW, "@ds163226.mlab.com:63226/heroku_qgv38qmv"), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

var db = _mongoose["default"].connection;
db.once("open", function () {
  console.log("MongoDB Connect!");
});