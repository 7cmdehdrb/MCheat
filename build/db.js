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
  _mongoose["default"].connect("mongodb://".concat(process.env.DB_USER, ":").concat(process.env.DB_PW, "@host1:port1,host2:port2/MCheat"), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

var db = _mongoose["default"].connection;
db.once("open", function () {
  console.log("MongoDB Connect!");
});