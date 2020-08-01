"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _report = require("../models/report");

var _middleware = require("../../middleware");

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

var _users = require("../models/users");

var _cheat = require("../models/cheat");

var express = require("express");

var router = express.Router();

/* GET home page. */
router.get("/", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var session, show, message, userCnt, cheatCnt, tradeCnt, count;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            session = req.session;
            show = req.flash("show");
            message = req.flash("message");
            userCnt = 0;
            cheatCnt = 0;
            tradeCnt = 0;
            _context.next = 8;
            return _users.User.count().exec()["catch"](function (err) {
              console.log(err);
            });

          case 8:
            userCnt = _context.sent;
            _context.next = 11;
            return _cheat.Cheat.count().exec()["catch"](function (err) {
              console.log(err);
            });

          case 11:
            cheatCnt = _context.sent;
            count = {
              user: userCnt,
              cheat: cheatCnt,
              trade: tradeCnt
            };
            res.render("core/index", {
              session: session,
              count: count,
              show: show,
              message: message
            });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
router.get("/report", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var id = req.query.id;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (!id) {
    res.send("\n            <script>\n                window.close();\n            </script>\n        ");
    return;
  }

  res.render("core/report", {
    session: session,
    csrfToken: csrfToken,
    id: id
  });
});
router.post("/report", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var session, _req$body, id, title, url, check1, check2, check3, check4, check5, check6, check7, content, catagories;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            session = req.session;
            _req$body = req.body, id = _req$body.id, title = _req$body.title, url = _req$body.url, check1 = _req$body.check1, check2 = _req$body.check2, check3 = _req$body.check3, check4 = _req$body.check4, check5 = _req$body.check5, check6 = _req$body.check6, check7 = _req$body.check7, content = _req$body.content;

            if (session.user) {
              _context2.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context2.abrupt("return");

          case 5:
            catagories = [];

            if (check1) {
              catagories.push(check1);
            }

            if (check2) {
              catagories.push(check2);
            }

            if (check3) {
              catagories.push(check3);
            }

            if (check4) {
              catagories.push(check4);
            }

            if (check5) {
              catagories.push(check5);
            }

            if (check6) {
              catagories.push(check6);
            }

            if (check7) {
              catagories.push(check7);
            }

            _context2.next = 15;
            return _report.Report.create({
              writerEmail: session.user.email,
              id: (0, _mongoSanitize["default"])(id),
              url: (0, _mongoSanitize["default"])(url),
              title: (0, _mongoSanitize["default"])(title),
              content: (0, _mongoSanitize["default"])(content),
              catagory: catagories
            })["catch"](function (err) {
              console.log(err);
            });

          case 15:
            res.send("\n        <script>\n            window.close();\n        </script>\n    ");

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}());
module.exports = router;