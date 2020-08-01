"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

var _users = require("../models/users");

var _utils = require("../../utils");

var _middleware = require("../../middleware");

var _cheat = require("../models/cheat");

var _communities = require("../models/communities");

var express = require("express");

var router = express.Router();

/* GET users listing. */
router.get("/", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            res.redirect("/");

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // 로그인

router.get("/login", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (session.user) {
    res.redirect("/users/logout");
    return;
  }

  var show = req.flash("show");
  var message = req.flash("message");
  res.render("user/login", {
    session: session,
    show: show,
    message: message,
    csrfToken: csrfToken
  });
});
router.post("/login", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var session, _req$body, email, password;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            session = req.session;
            _req$body = req.body, email = _req$body.email, password = _req$body.password;

            if (!session.user) {
              _context2.next = 5;
              break;
            }

            res.redirect("/users/logout");
            return _context2.abrupt("return");

          case 5:
            _context2.next = 7;
            return _users.User.findOne({
              $and: [{
                email: (0, _mongoSanitize["default"])(email)
              }, {
                password: (0, _utils.hashFunction)((0, _mongoSanitize["default"])(password))
              }]
            }).select("\n        email\n        nickname\n        email_valid\n        is_admin\n        is_activated\n        ").exec().then(function (user) {
              console.log("Login");
              console.log(user);

              if (user == null) {
                throw Error();
              } else {
                if (user.email_valid == false) {
                  req.flash("show", true);
                  req.flash("message", "이메일 인증을 진행해주세요");
                  res.redirect("/users/login");
                } else if (user.is_activated == false) {
                  req.flash("show", true);
                  req.flash("message", "비활성화된 계정입니다 관리자에게 문의해주세요");
                  res.redirect("/users/login");
                } else {
                  session.user = user;
                  session.save(function () {
                    res.redirect("/");
                  });
                }
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "로그인에 실패했습니다");
              res.redirect("/users/login");
            });

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // 로그아웃

router.get("/logout", function (req, res, next) {
  var session = req.session;

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  var user = session.user.email;
  session.destroy();
  res.render("user/logout", {
    user: user
  });
}); // 회원가입

router.get("/signup", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (session.user) {
    res.redirect("user/logout");
    return;
  }

  var show = req.flash("show");
  var message = req.flash("message");
  res.render("user/signup", {
    session: session,
    show: show,
    message: message,
    csrfToken: csrfToken
  });
});
router.post("/signup", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var session, _req$body2, email, password, nickname, server, guild, farm, profile;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            session = req.session;
            _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password, nickname = _req$body2.nickname, server = _req$body2.server, guild = _req$body2.guild, farm = _req$body2.farm, profile = _req$body2.profile;

            if (!session.user) {
              _context3.next = 5;
              break;
            }

            res.redirect("/users/logout");
            return _context3.abrupt("return");

          case 5:
            _context3.next = 7;
            return _users.User.create({
              email: (0, _mongoSanitize["default"])(email),
              password: (0, _mongoSanitize["default"])((0, _utils.hashFunction)(password)),
              nickname: (0, _mongoSanitize["default"])(nickname),
              server: (0, _mongoSanitize["default"])(server),
              guild: (0, _mongoSanitize["default"])(guild),
              farm: (0, _mongoSanitize["default"])(farm.trim()),
              profile: (0, _mongoSanitize["default"])(profile),
              email_secret: (0, _utils.createUUID)(),
              email_valid: false,
              is_admin: false,
              is_activated: true
            }).then(function (user) {
              (0, _utils.sendMail)(user.email, user.email_secret);
              req.flash("show", true);
              req.flash("message", "회원가입에 성공하였습니다! 이메일 인증을 진행하고 로그인해주세요");
              res.redirect("/users/login");
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", true);
              req.flash("message", "회원가입에 실패하였습니다. 이미 가입된 이메일/캐릭터입니다. 만약 다른 계정/캐릭터로도 이 오류가 지속된다면 관리자에게 문의해주십시오");
              res.redirect("/users/signup");
            });

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}()); // 프로필 보기

router.get("/userProfile", /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var session, id, show, message, user, cheatPoint, communityPoint, commentPoint, point;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            session = req.session;
            id = req.query.id;

            if (session.user) {
              _context4.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context4.abrupt("return");

          case 5:
            show = req.flash("show");
            message = req.flash("message");
            _context4.next = 9;
            return _users.User.findOne({
              email: id || session.user.email
            }).select("\n            email\n            nickname\n            server\n            guild\n            farm\n            profile\n            bio\n            email_valid\n            is_admin\n            is_activated\n            ").exec()["catch"](function (err) {
              console.log(err);
            });

          case 9:
            user = _context4.sent;

            if (!(user == null)) {
              _context4.next = 13;
              break;
            }

            res.redirect("/");
            return _context4.abrupt("return");

          case 13:
            _context4.next = 15;
            return _cheat.Cheat.count({
              writerEmail: id || session.user.email
            })["catch"](function (err) {
              console.log(err);
            });

          case 15:
            cheatPoint = _context4.sent;
            _context4.next = 18;
            return _communities.Community.count({
              writerEmail: id || session.user.email
            })["catch"](function (err) {
              console.log(err);
            });

          case 18:
            communityPoint = _context4.sent;
            _context4.next = 21;
            return _communities.Community.count({
              writerEmail: id || session.user.email
            })["catch"](function (err) {
              console.log(err);
            });

          case 21:
            commentPoint = _context4.sent;
            point = {
              cheat: cheatPoint || 0,
              community: commentPoint || 0,
              comment: commentPoint || 0,
              total: (cheatPoint || 0) * 15 + (communityPoint || 0) * 3 + (commentPoint || 0)
            };
            res.render("user/detail", {
              session: session,
              user: user,
              point: point,
              show: show,
              message: message
            });

          case 24:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}()); // 개인정보 수정

router.get("/editProfile", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var session, csrfToken, show, message, defaultUser;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            session = req.session;
            csrfToken = req.csrfToken();
            show = req.flash("show");
            message = req.flash("message");

            if (session.user) {
              _context5.next = 7;
              break;
            }

            res.redirect("/users/login");
            return _context5.abrupt("return");

          case 7:
            _context5.next = 9;
            return _users.User.findOne({
              email: session.user.email
            }).select("\n        email\n        nickname\n        farm\n        bio\n        ").exec()["catch"](function (err) {
              console.log(err);
              res.redirect("/");
              return;
            });

          case 9:
            defaultUser = _context5.sent;

            if (!(defaultUser == null)) {
              _context5.next = 13;
              break;
            }

            res.redirect("/");
            return _context5.abrupt("return");

          case 13:
            res.render("user/editProfile", {
              session: session,
              defaultUser: defaultUser,
              show: show,
              message: message,
              csrfToken: csrfToken
            });

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}());
router.post("/editProfile", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var session, _req$body3, farm, nickname, server, guild, profile, bio;

    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            session = req.session;
            _req$body3 = req.body, farm = _req$body3.farm, nickname = _req$body3.nickname, server = _req$body3.server, guild = _req$body3.guild, profile = _req$body3.profile, bio = _req$body3.bio;

            if (session.user) {
              _context6.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context6.abrupt("return");

          case 5:
            _context6.next = 7;
            return _users.User.updateOne({
              email: session.user.email
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
                req.flash("message", "정보를 변경했습니다! 다시 로그인 하여 정보를 갱신해주세요");
                res.redirect("/users/logout");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "정보를 변경할 수 없습니다. 이미 사용중인 캐릭터일 수 있습니다");
              res.redirect("/users/editProfile");
            });

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}()); // 비밀번호 변경

router.get("/changePassword", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  var show = req.flash("show");
  var message = req.flash("message");
  res.render("user/changePassword", {
    session: session,
    show: show,
    message: message,
    csrfToken: csrfToken
  });
});
router.post("/changePassword", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var session, _req$body4, current_password, password;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            session = req.session;
            _req$body4 = req.body, current_password = _req$body4.current_password, password = _req$body4.password;

            if (session.user) {
              _context7.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context7.abrupt("return");

          case 5:
            _context7.next = 7;
            return _users.User.updateOne({
              $and: [{
                email: session.user.email
              }, {
                password: (0, _mongoSanitize["default"])((0, _utils.hashFunction)(current_password))
              }]
            }, {
              $set: {
                password: (0, _mongoSanitize["default"])((0, _utils.hashFunction)(password))
              }
            }).then(function (user) {
              if (user.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "비밀번호 변경했습니다! 다시 로그인 하여 정보를 갱신해주세요");
                res.redirect("/users/logout");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "비밀번호 변경할 수 없습니다");
              res.redirect("/users/changePassword");
            });

          case 7:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}()); // 비밀번호 초기화

router.get("/findPassword", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (session.user) {
    res.redirect("/users/logout");
    return;
  }

  var show = req.flash("show");
  var message = req.flash("message");
  res.render("user/findPassword", {
    session: session,
    show: show,
    message: message,
    csrfToken: csrfToken
  });
});
router.post("/findPassword", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var session, _req$body5, email, nickname, newSecret, targetUser;

    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            session = req.session;
            _req$body5 = req.body, email = _req$body5.email, nickname = _req$body5.nickname;
            newSecret = (0, _utils.createUUID)();

            if (!session.user) {
              _context8.next = 6;
              break;
            }

            res.redirect("/users/logout");
            return _context8.abrupt("return");

          case 6:
            _context8.next = 8;
            return _users.User.findOne({
              $and: [{
                email: (0, _mongoSanitize["default"])(email)
              }, {
                nickname: (0, _mongoSanitize["default"])(nickname)
              }]
            }).select("_id").exec()["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/users/findPassword");
              return;
            });

          case 8:
            targetUser = _context8.sent;

            if (!(targetUser == null)) {
              _context8.next = 14;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "해당 사용자를 찾을 수 없습니다");
            res.redirect("/users/findPassword");
            return _context8.abrupt("return");

          case 14:
            _context8.next = 16;
            return _users.User.updateOne({
              $and: [{
                email: (0, _mongoSanitize["default"])(email)
              }, {
                nickname: (0, _mongoSanitize["default"])(nickname)
              }, {
                email_valid: true
              }]
            }, {
              $set: {
                email_secret: newSecret
              }
            }).then(function (updatedUser) {
              if (updatedUser.nModified == 1) {
                (0, _utils.sendResetMail)(email, newSecret);
                req.flash("show", "true");
                req.flash("message", "이메일을 확인해주세요");
                res.redirect("/users/login");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/users/findPassword");
            });

          case 16:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}()); // BACK
// Email > Reset Password

router.get("/resetPassword", /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var session, secret;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            session = req.session;
            secret = req.query.secret;

            if (!session.user) {
              _context9.next = 5;
              break;
            }

            res.redirect("/users/logout");
            return _context9.abrupt("return");

          case 5:
            _context9.next = 7;
            return _users.User.updateOne({
              $and: [{
                email_valid: true
              }, {
                email_secret: (0, _mongoSanitize["default"])(secret)
              }]
            }, {
              $set: {
                email_secret: null,
                password: (0, _utils.hashFunction)("0000")
              }
            }).then(function (updatedUser) {
              if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "비밀번호가 성공적으로 초기화되었습니다. 로그인 후에 비밀번호를 다시 변경해주세요");
                res.redirect("/users/login");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "비밀번호 초기화에 실패하였습니다");
              res.redirect("/");
            });

          case 7:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x25, _x26, _x27) {
    return _ref9.apply(this, arguments);
  };
}()); // Email > Verify Email

router.get("/verifyEmail", /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var session, secret;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            session = req.session;
            secret = req.query.secret;

            if (!session.user) {
              _context10.next = 5;
              break;
            }

            res.redirect("/users/logout");
            return _context10.abrupt("return");

          case 5:
            _context10.next = 7;
            return _users.User.updateOne({
              $and: [{
                email_valid: false
              }, {
                email_secret: (0, _mongoSanitize["default"])(secret)
              }]
            }, {
              $set: {
                email_valid: true,
                email_secret: null
              }
            }).then(function (updatedUser) {
              if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "인증에 성공하였습니다!");
                res.redirect("/users/login");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "인증에 실패하였습니다");
              res.redirect("/");
            });

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x28, _x29, _x30) {
    return _ref10.apply(this, arguments);
  };
}()); // Sign up > Find Char

router.get("/searchNickname", /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res, next) {
    var id, _yield$getGuild, guild, server, profile;

    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            id = req.query.id;
            _context11.next = 3;
            return (0, _utils.getGuild)(id);

          case 3:
            _yield$getGuild = _context11.sent;
            guild = _yield$getGuild.guild;
            server = _yield$getGuild.server;
            profile = _yield$getGuild.profile;
            res.json({
              guild: (0, _mongoSanitize["default"])(guild),
              server: (0, _mongoSanitize["default"])(server),
              profile: (0, _mongoSanitize["default"])(profile)
            });

          case 8:
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
module.exports = router;