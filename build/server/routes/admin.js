"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

var _users = require("../models/users");

var _ips = require("../models/ips");

var _cheat = require("../models/cheat");

var _report = require("../models/report");

require("../../env");

var _middleware = require("../../middleware");

var _utils = require("../../utils");

var express = require("express");

var router = express.Router();
// 메뉴
router.get("/", function (req, res, next) {
  var session = req.session;

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  var show = req.flash("show");
  var message = req.flash("message");
  res.render("admin/adminMenu", {
    session: session,
    show: show,
    message: message
  });
}); // 관리자 권한 받기

router.get("/getAdminPermission", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  res.render("admin/getAdminPermission", {
    session: session,
    csrfToken: csrfToken
  });
});
router.post("/getAdminPermission", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var session, adminKey;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            session = req.session;
            adminKey = req.body.adminKey;

            if (session.user) {
              _context.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context.abrupt("return");

          case 5:
            if (!(session.user.is_admin == true)) {
              _context.next = 8;
              break;
            }

            res.redirect("/admin");
            return _context.abrupt("return");

          case 8:
            if (!((0, _mongoSanitize["default"])(adminKey) == process.env.ADMIN_KEY)) {
              _context.next = 13;
              break;
            }

            _context.next = 11;
            return _users.User.updateOne({
              $and: [{
                email: (0, _mongoSanitize["default"])(session.user.email)
              }, {
                is_admin: false
              }]
            }, {
              $set: {
                is_admin: true
              }
            }).then(function (newAdmin) {
              if (newAdmin.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "관리자권한 부여에 성공하였습니다! 재로그인 해주세요");
                session.destroy();
                res.redirect("/");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생하였습니다");
              res.redirect("/");
            });

          case 11:
            _context.next = 16;
            break;

          case 13:
            req.flash("show", "true");
            req.flash("message", "관리자 키가 일치하지 않습니다");
            res.redirect("/");

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // 차단 유저 관리

router.get("/prohibitIp", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var session, page, csrfToken, show, message;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            session = req.session;
            page = req.query.page;
            csrfToken = req.csrfToken();

            if (session.user) {
              _context2.next = 6;
              break;
            }

            res.redirect("/users/login");
            return _context2.abrupt("return");

          case 6:
            if (!(session.user.is_admin != true)) {
              _context2.next = 11;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context2.abrupt("return");

          case 11:
            show = req.flash("show");
            message = req.flash("message");
            _context2.next = 15;
            return _ips.IP.paginate({// query
            }, {
              sort: "ip",
              page: page || 1,
              limit: 20
            }, {}).then(function (ip) {
              var docs = ip.docs,
                  page = ip.page,
                  totalPages = ip.totalPages;
              res.render("admin/prohibitIp", {
                session: session,
                ip: docs,
                current_page: page,
                total_page: totalPages,
                show: show,
                message: message,
                csrfToken: csrfToken
              });
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/");
            });

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // 차단 유저 등록

router.post("/newProhibition", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var session, ip, newIp;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            session = req.session;
            ip = req.body.ip;

            if (session.user) {
              _context3.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context3.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context3.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context3.abrupt("return");

          case 10:
            _context3.next = 12;
            return _ips.IP.create({
              ip: (0, _mongoSanitize["default"])(ip)
            })["catch"](function (err) {
              console.log(err);
            });

          case 12:
            newIp = _context3.sent;

            if (!(newIp == null)) {
              _context3.next = 19;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "추가에 실패하였습니다");
            res.redirect("/admin/prohibitIp");
            _context3.next = 24;
            break;

          case 19:
            _context3.next = 21;
            return (0, _ips.getBannedIps)();

          case 21:
            // cannot use then
            req.flash("show", "true");
            req.flash("message", "".concat(newIp.ip, "\uAC00 \uCC28\uB2E8 \uBAA9\uB85D\uC5D0 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4"));
            res.redirect("/admin/prohibitIp");

          case 24:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}()); // 차단 유저 해제

router.get("/removeProhibition", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var id = req.query.id;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (session.user.is_admin != true) {
    req.flash("show", "true");
    req.flash("message", "관리자 전용 기능입니다");
    res.redirect("/");
    return;
  }

  res.render("admin/removeProhibition", {
    id: id,
    csrfToken: csrfToken
  });
});
router.post("/removeProhibition", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var session, id, removeIp;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            session = req.session;
            id = req.body.id;

            if (session.user) {
              _context4.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context4.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context4.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context4.abrupt("return");

          case 10:
            _context4.next = 12;
            return _ips.IP.deleteOne({
              _id: (0, _mongoSanitize["default"])(id)
            })["catch"](function (err) {
              console.log(err);
            });

          case 12:
            removeIp = _context4.sent;

            if (!(removeIp.deletedCount == 1)) {
              _context4.next = 21;
              break;
            }

            _context4.next = 16;
            return (0, _ips.getBannedIps)();

          case 16:
            // cannot use then
            req.flash("show", "true");
            req.flash("message", "삭제에 성공했습니다");
            res.redirect("/admin/prohibitIp");
            _context4.next = 25;
            break;

          case 21:
            console.log(removeIp);
            req.flash("show", "true");
            req.flash("message", "삭제에 실패하였습니다");
            res.redirect("/admin/prohibitIp");

          case 25:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}()); // 유저 리스트

router.get("/allUsers", /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var session, _req$query, page, key, value, show, message, query;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            session = req.session;
            _req$query = req.query, page = _req$query.page, key = _req$query.key, value = _req$query.value;

            if (session.user) {
              _context5.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context5.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context5.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context5.abrupt("return");

          case 10:
            show = req.flash("show");
            message = req.flash("message");

            if (value) {
              // 검색 조건이 있을 때
              query = (0, _defineProperty2["default"])({}, key, {
                $regex: ".*".concat((0, _mongoSanitize["default"])(value), ".*")
              });
            } else {
              query = {};
            }

            _context5.next = 15;
            return _users.User.paginate(query, {
              select: "\n            email\n            nickname\n            server\n            guild\n            farm\n            profile\n            email_secret\n            email_valid\n            is_admin\n            is_activated\n            ",
              page: page || 1,
              limit: 15
            }, {}).then(function (users) {
              var docs = users.docs,
                  current_page = users.page,
                  totalPages = users.totalPages;

              if (page > totalPages) {
                res.redirect("/admin/allUsers?page=".concat(totalPages));
              } else {
                res.render("admin/adminAllUsers", {
                  session: session,
                  users: docs,
                  current_page: current_page,
                  total_page: totalPages,
                  show: show,
                  message: message
                });
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생하였습니다");
              res.redirect("/");
            });

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}()); // 프로필 변경

router.get("/editProfile", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var session, id, csrfToken, show, message;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            session = req.session;
            id = req.query.id;
            csrfToken = req.csrfToken();

            if (session.user) {
              _context6.next = 6;
              break;
            }

            res.redirect("/users/login");
            return _context6.abrupt("return");

          case 6:
            if (!(session.user.is_admin != true)) {
              _context6.next = 11;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context6.abrupt("return");

          case 11:
            show = req.flash("show");
            message = req.flash("message");
            _context6.next = 15;
            return _users.User.findOne({
              email: (0, _mongoSanitize["default"])(id)
            }).select("\n        email\n        nickname\n        farm\n        bio\n        ").exec().then(function (targetUser) {
              if (targetUser == null) {
                throw Error();
              }

              res.render("user/editProfile", {
                session: session,
                defaultUser: targetUser,
                show: show,
                message: message,
                csrfToken: csrfToken
              });
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "해당 유저를 찾을 수 없습니다");
              res.redirect("/admin");
            });

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}());
router.post("/editProfile", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var session, _req$body, email, farm, nickname, server, guild, profile, bio;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            session = req.session;
            _req$body = req.body, email = _req$body.email, farm = _req$body.farm, nickname = _req$body.nickname, server = _req$body.server, guild = _req$body.guild, profile = _req$body.profile, bio = _req$body.bio;

            if (session.user) {
              _context7.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context7.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context7.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context7.abrupt("return");

          case 10:
            _context7.next = 12;
            return _users.User.updateOne({
              email: (0, _mongoSanitize["default"])(email)
            }, {
              $set: {
                nickname: (0, _mongoSanitize["default"])(nickname),
                server: (0, _mongoSanitize["default"])(server),
                guild: (0, _mongoSanitize["default"])(guild),
                farm: (0, _mongoSanitize["default"])(farm.trim()),
                profile: (0, _mongoSanitize["default"])(profile),
                bio: (0, _mongoSanitize["default"])(bio)
              }
            }).then(function (updatedUser) {
              if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "성공적으로 변경하였습니다!");
                res.redirect("/admin/allUsers");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생하였습니다");
              res.redirect("/admin/allUsers");
            });

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}()); // 유저 (비)활성화

router.get("/changeActivation", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var _req$query2 = req.query,
      id = _req$query2.id,
      status = _req$query2.status;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (session.user.is_admin != true) {
    req.flash("show", "true");
    req.flash("message", "관리자 전용 기능입니다");
    res.redirect("/");
    return;
  }

  res.render("admin/changeActivation", {
    id: id,
    status: status,
    csrfToken: csrfToken
  });
});
router.post("/changeActivation", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var session, _req$body2, id, status;

    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            session = req.session;
            _req$body2 = req.body, id = _req$body2.id, status = _req$body2.status;

            if (session.user) {
              _context8.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context8.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context8.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context8.abrupt("return");

          case 10:
            _context8.next = 12;
            return _users.User.updateOne({
              $and: [{
                email: (0, _mongoSanitize["default"])(id)
              }, {
                is_activated: (0, _mongoSanitize["default"])(status) == "activate" ? true : false
              }]
            }, {
              $set: {
                is_activated: (0, _mongoSanitize["default"])(status) == "activate" ? false : true
              }
            }).then(function (updatedUser) {
              if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "성공적으로 변경하였습니다");
                res.redirect("/admin/allUsers");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생하였습니다");
              res.redirect("/admin/allUsers");
            });

          case 12:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}()); // 유저 완전 삭제

router.get("/deleteUser", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var id = req.query.id;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (session.user.is_admin != true) {
    req.flash("show", "true");
    req.flash("message", "관리자 전용 기능입니다");
    res.redirect("/");
    return;
  }

  res.render("admin/deleteUser", {
    id: id,
    csrfToken: csrfToken
  });
});
router.post("/deleteUser", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var session, id;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            session = req.session;
            id = req.body.id;

            if (session.user) {
              _context9.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context9.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context9.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context9.abrupt("return");

          case 10:
            _context9.next = 12;
            return _users.User.deleteOne({
              email: (0, _mongoSanitize["default"])(id)
            }).then(function (deletedUser) {
              if (deletedUser.deletedCount == 1) {
                req.flash("show", "true");
                req.flash("message", "성공적으로 삭제하였습니다");
                res.redirect("/");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생하였습니다");
              res.redirect("/admin/allUsers");
            });

          case 12:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x25, _x26, _x27) {
    return _ref9.apply(this, arguments);
  };
}()); // 사기 제보 삭제

router.get("/deleteCheat", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var id = req.query.id;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (!id) {
    res.redirect("/");
    return;
  }

  if (session.user.is_admin != true) {
    req.flash("show", "true");
    req.flash("message", "관리자 전용 기능입니다");
    res.redirect("/");
    return;
  }

  res.render("admin/deleteCheat", {
    session: session,
    id: id,
    csrfToken: csrfToken
  });
});
router.post("/deleteCheat", /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var session, id;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            session = req.session;
            id = req.body.id;

            if (session.user) {
              _context10.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context10.abrupt("return");

          case 5:
            if (id) {
              _context10.next = 8;
              break;
            }

            res.redirect("/");
            return _context10.abrupt("return");

          case 8:
            if (!(session.user.is_admin != true)) {
              _context10.next = 13;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context10.abrupt("return");

          case 13:
            _context10.next = 15;
            return _cheat.Cheat.deleteOne({
              _id: (0, _mongoSanitize["default"])(id)
            }).then(function (deleteOne) {
              if (deleteOne.deletedCount == 1) {
                // TO DO: redirect to report list
                res.redirect("/");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "제보 삭제에 실패하였습니다");
              res.redirect("/");
            });

          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x28, _x29, _x30) {
    return _ref10.apply(this, arguments);
  };
}()); // 신고 조회

router.get("/report", /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res, next) {
    var session, _req$query3, page, finish, show, message, query;

    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            session = req.session;
            _req$query3 = req.query, page = _req$query3.page, finish = _req$query3.finish;

            if (session.user) {
              _context11.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context11.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context11.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context11.abrupt("return");

          case 10:
            show = req.flash("show");
            message = req.flash("message");
            query = {};

            if (finish) {
              query = {
                is_finished: true
              };
            } else {
              query = {
                is_finished: false
              };
            }

            _context11.next = 16;
            return _report.Report.paginate(query, {
              page: page || 1,
              limit: 20,
              select: "\n            writerEmail    \n            title\n            date\n            is_finished\n            ",
              sort: "-date",
              populate: {
                path: "writer",
                select: "\n                _id\n                email\n                nickname\n                ",
                model: "User"
              }
            }, {}).then(function (reports) {
              reports.docs = reports.docs.filter(function (element) {
                return element.writer != null;
              });

              if (page > reports.totalPages) {
                res.redirect("/admin/report?page=1");
              } else {
                res.render("admin/reports", {
                  session: session,
                  reports: reports,
                  show: show,
                  message: message
                });
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "신고 목록을 불러오는데 실패했습니다");
              req.redirect("/");
            });

          case 16:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function (_x31, _x32, _x33) {
    return _ref11.apply(this, arguments);
  };
}());
router.get("/reportDetail", /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(req, res, next) {
    var session, id;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            session = req.session;
            id = req.query.id;

            if (session.user) {
              _context12.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context12.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context12.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context12.abrupt("return");

          case 10:
            if (id) {
              _context12.next = 13;
              break;
            }

            res.redirect("/admin/report");
            return _context12.abrupt("return");

          case 13:
            _context12.next = 15;
            return _report.Report.findOne({
              _id: (0, _mongoSanitize["default"])(id)
            }).populate("writer", "\n        _id\n        nickname\n        email\n    ").exec().then(function (report) {
              if (report == null) {
                throw Error();
              } else {
                if (report.writer == null) {
                  req.flash("show", "true");
                  req.flash("message", "삭제된 유저입니다");
                  res.redirect("/admin/report");
                } else {
                  res.render("admin/reportDetail", {
                    session: session,
                    report: report
                  });
                }
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "신고를 찾을 수 없습니다");
              res.redirect("/admin/report");
            });

          case 15:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function (_x34, _x35, _x36) {
    return _ref12.apply(this, arguments);
  };
}());
router.get("/completeReport", /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(req, res, next) {
    var session, id;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            session = req.session;
            id = req.query.id;

            if (session.user) {
              _context13.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context13.abrupt("return");

          case 5:
            if (!(session.user.is_admin != true)) {
              _context13.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context13.abrupt("return");

          case 10:
            if (id) {
              _context13.next = 13;
              break;
            }

            res.redirect("/admin/report");
            return _context13.abrupt("return");

          case 13:
            _context13.next = 15;
            return _report.Report.updateOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(id)
              }, {
                is_finished: false
              }]
            }, {
              $set: {
                is_finished: true
              }
            }).then(function (updateOne) {
              if (updateOne.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "처리에 성공하였습니다");
                res.redirect("/admin/report");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "처리에 실패하였습니다");
              res.redirect("/admin/report");
            });

          case 15:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function (_x37, _x38, _x39) {
    return _ref13.apply(this, arguments);
  };
}());
module.exports = router;