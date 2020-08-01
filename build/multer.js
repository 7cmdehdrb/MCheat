"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cheatUpload = exports.upload = void 0;

var _multer = _interopRequireDefault(require("multer"));

var _utils = require("./utils");

var upload = (0, _multer["default"])({
  storage: _multer["default"].diskStorage({
    destination: function destination(req, file, cb) {
      cb(null, "public/uploads/");
    },
    filename: function filename(req, file, cb) {
      var _req$body = req.body,
          writerEmail = _req$body.writerEmail,
          title = _req$body.title;
      var mimetype = file.mimetype;
      var dateFormat = (0, _utils.newDatetimeFormat)();
      var fileType = mimetype.split("/")[1];
      var newFileName = "".concat(dateFormat, "_").concat(writerEmail, "_").concat(title, ".").concat(fileType);
      cb(null, newFileName);
    }
  })
});
exports.upload = upload;
var cheatUpload = (0, _multer["default"])({
  storage: _multer["default"].diskStorage({
    destination: function destination(req, file, cb) {
      cb(null, "public/cheatUploads/");
    },
    filename: function filename(req, file, cb) {
      var email = req.session.user.email;
      var mimetype = file.mimetype,
          originalname = file.originalname;
      var dateFormat = (0, _utils.newDatetimeFormat)();
      var fileType = mimetype.split("/")[1];
      var newFileName = "".concat(dateFormat, "_").concat(email, "_").concat(originalname, ".").concat(fileType);
      cb(null, newFileName);
    }
  })
});
exports.cheatUpload = cheatUpload;