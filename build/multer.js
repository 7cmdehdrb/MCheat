"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cheatUpload = exports.upload = void 0;

require("./env");

var _multer = _interopRequireDefault(require("multer"));

var _multerS = _interopRequireDefault(require("multer-s3"));

var _utils = require("./utils");

var AWS = require("aws-sdk");

AWS.config = {
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: "ap-northeast-2"
};
var s3 = new AWS.S3();
var upload = (0, _multer["default"])({
  storage: (0, _multerS["default"])({
    s3: s3,
    bucket: "mcheat-s3-bucket/uploads",
    acl: "public-read-write",
    metadata: function metadata(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname
      });
    },
    key: function key(req, file, cb) {
      var email = req.session.user.email;
      var title = req.body.title;
      var mimetype = file.mimetype;
      var dateFormat = (0, _utils.newDatetimeFormat)();
      var fileType = mimetype.split("/")[1];
      var newFileName = "".concat(dateFormat, "_").concat(email, "_").concat(title, ".").concat(fileType);
      cb(null, newFileName);
    }
  })
});
exports.upload = upload;
var cheatUpload = (0, _multer["default"])({
  storage: (0, _multerS["default"])({
    s3: s3,
    bucket: "mcheat-s3-bucket/cheatUploads",
    acl: "public-read-write",
    metadata: function metadata(req, file, cb) {
      cb(null, {
        fieldName: file.fieldname
      });
    },
    key: function key(req, file, cb) {
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