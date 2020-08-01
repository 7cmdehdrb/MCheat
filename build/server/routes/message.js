"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _middleware = require("../../middleware");

var _utils = require("../../utils");

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

var _messages = require("../models/messages");

var _main = require("sriracha/lib/controllers/main");

var express = require("express");

var router = express.Router();
router.get("/", function (req, res, next) {
  res.redirect("/");
}); // 귓속말

router.get("/instantMessage", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var session, myMessages;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            session = req.session;

            if (session.user) {
              _context.next = 4;
              break;
            }

            res.redirect("/users/login");
            return _context.abrupt("return");

          case 4:
            _context.next = 6;
            return _messages.InstantMessage.find({
              $or: [{
                to: {
                  $eq: session.user.nickname
                }
              }, {
                from_email: {
                  $eq: session.user.email
                }
              }]
            }) // .limit(100)
            .sort("time") // 최근이 아래
            .exec()["catch"](function (err) {
              console.log(err);
            });

          case 6:
            myMessages = _context.sent;
            res.render("message/instantMessage", {
              session: session,
              messages: myMessages
            });

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // 참여한 그룹

router.get("/groupMessage", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var session, show, message;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            session = req.session;

            if (session.user) {
              _context2.next = 4;
              break;
            }

            res.redirect("/users/login");
            return _context2.abrupt("return");

          case 4:
            show = req.flash("show");
            message = req.flash("message");
            _context2.next = 8;
            return _messages.GroupMessageRoom.find({
              "roomMember.user": session.user.email
            }).select("\n        name\n        introduce\n        masterEmail\n        roomMember\n        ").sort("-time") // 최근이 위
            .populate("master", "_id email nickname").exec().then(function (rooms) {
              var newRooms = rooms.filter(function (element) {
                return element.master != null;
              });
              res.render("message/groupMessageList", {
                session: session,
                rooms: newRooms,
                show: show,
                message: message
              });
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/");
            });

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // 그룹체팅 생성

router.get("/newGroup", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  res.render("message/newGroup", {
    session: session,
    csrfToken: csrfToken
  });
});
router.post("/newGroup", /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var session, _req$body, name, password, introduce;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            session = req.session;
            _req$body = req.body, name = _req$body.name, password = _req$body.password, introduce = _req$body.introduce;

            if (session.user) {
              _context3.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context3.abrupt("return");

          case 5:
            _context3.next = 7;
            return _messages.GroupMessageRoom.create({
              name: (0, _mongoSanitize["default"])(name),
              password: (0, _utils.hashFunction)((0, _mongoSanitize["default"])(password)),
              introduce: (0, _mongoSanitize["default"])(introduce),
              masterEmail: session.user.email,
              roomMember: [{
                user: session.user.email
              }]
            }).then(function (group) {
              res.redirect("/messages/groupMessage");
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/");
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
}()); //  참여 가능 그룹

router.get("/joinGroupList", /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var session, _req$query, page, search, show, message, query, groups;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            session = req.session;
            _req$query = req.query, page = _req$query.page, search = _req$query.search;

            if (session.user) {
              _context4.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context4.abrupt("return");

          case 5:
            show = req.flash("show");
            message = req.flash("message");
            query = {};

            if (search) {
              query = {
                $and: [{
                  "roomMember.user": {
                    $ne: session.user.email
                  }
                }, {
                  name: {
                    $regex: ".*".concat((0, _mongoSanitize["default"])(search), ".*")
                  }
                }]
              };
            } else {
              query = {
                "roomMember.user": {
                  $ne: session.user.email
                }
              };
            }

            _context4.next = 11;
            return _messages.GroupMessageRoom.paginate(query, {
              select: "\n            _id\n            name\n            masterEmail\n            roomMember\n            ",
              page: page || 1,
              limit: 30,
              sort: "-time",
              // 최근이 위
              populate: {
                path: "master",
                select: "\n                email\n                nickname\n                ",
                model: "User"
              }
            }, {}).then(function (groups) {
              groups.docs = groups.docs.filter(function (element) {
                return element.master != null;
              });
              return groups;
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/");
            });

          case 11:
            groups = _context4.sent;
            res.render("message/groupList", {
              session: session,
              groups: groups,
              show: show,
              message: message
            });

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}()); // 그룹 가입

router.get("/joinGroup", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var session, room, csrfToken;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            session = req.session;
            room = req.query.room;
            csrfToken = req.csrfToken();

            if (session.user) {
              _context5.next = 6;
              break;
            }

            res.redirect("/users/login");
            return _context5.abrupt("return");

          case 6:
            if (room) {
              _context5.next = 9;
              break;
            }

            res.redirect("/messages/joinGroupList");
            return _context5.abrupt("return");

          case 9:
            _context5.next = 11;
            return _messages.GroupMessageRoom.findOne({
              _id: (0, _mongoSanitize["default"])(room)
            }).select("\n        name\n        introduce\n        masterEmail\n        roomMember\n        ").populate("master", "\n            email\n            nickname\n        ").then(function (findRoom) {
              if (findRoom == null) {
                throw Error();
              } else {
                res.render("message/joinGroup", {
                  session: session,
                  room: findRoom,
                  csrfToken: csrfToken
                });
              }
            })["catch"](function (err) {
              console.log(err);
              res.redirect("/messages/joinGroupList");
            });

          case 11:
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
router.post("/joinGroup", /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var session, _req$body2, roomID, roomPW, check, room;

    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            session = req.session;
            _req$body2 = req.body, roomID = _req$body2.roomID, roomPW = _req$body2.roomPW;
            check = true;

            if (session.user) {
              _context6.next = 6;
              break;
            }

            res.redirect("/user/login");
            return _context6.abrupt("return");

          case 6:
            _context6.next = 8;
            return _messages.GroupMessageRoom.findOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(roomID)
              }, {
                password: (0, _utils.hashFunction)((0, _mongoSanitize["default"])(roomPW))
              }]
            }).exec()["catch"](function (err) {
              console.log(err);
            });

          case 8:
            room = _context6.sent;

            if (!(room == null)) {
              _context6.next = 14;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "비밀번호가 일치하지 않습니다");
            res.redirect("/messages/joinGroupList");
            return _context6.abrupt("return");

          case 14:
            room.roomMember.forEach(function (element) {
              if (element.user == session.user.email) {
                check = false; // 이미 가입된 상태
              }
            });

            if (!check) {
              _context6.next = 20;
              break;
            }

            _context6.next = 18;
            return _messages.GroupMessageRoom.updateOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(roomID)
              }, {
                password: (0, _utils.hashFunction)((0, _mongoSanitize["default"])(roomPW))
              }]
            }, {
              $push: {
                roomMember: {
                  user: session.user.email
                }
              }
            }).then(function (newUser) {
              if (newUser.nModified != 1) {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "체팅방에 참여할 수 없습니다");
            });

          case 18:
            _context6.next = 22;
            break;

          case 20:
            req.flash("show", "true");
            req.flash("message", "이미 참여중인 체팅방입니다");

          case 22:
            res.redirect("/messages/groupMessage");

          case 23:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}()); // 그룹 나가기
// CSRF 인증

router.get("/leaveGroup", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var room = req.query.room;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (!room) {
    res.redirect("/messages/groupMessage");
    return;
  }

  res.render("message/leaveGroup", {
    session: session,
    room: room,
    csrfToken: csrfToken
  });
});
router.post("/leaveGroup", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var session, room;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            session = req.session;
            room = req.body.room;

            if (session.user) {
              _context7.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context7.abrupt("return");

          case 5:
            if (room) {
              _context7.next = 8;
              break;
            }

            res.redirect("/messages/groupMessage");
            return _context7.abrupt("return");

          case 8:
            _context7.next = 10;
            return _messages.GroupMessageRoom.updateOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(room)
              }, {
                "roomMember.user": session.user.email
              }, {
                masterEmail: {
                  $ne: session.user.email
                }
              }]
            }, {
              $pull: {
                roomMember: {
                  user: session.user.email
                }
              }
            }).then(function (updateOne) {
              if (updateOne.nModified == 1) {
                res.redirect("/messages/groupMessage");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "실패하였습니다");
              res.redirect("/messages/groupMessage");
            });

          case 10:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}()); // 그룹 삭제
// CSRF 인증

router.get("/deleteGroup", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var room = req.query.room;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (!room) {
    res.redirect("/messages/groupMessage");
    return;
  }

  res.render("message/deleteGroup", {
    room: room,
    csrfToken: csrfToken
  });
});
router.post("/deleteGroup", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var session, room;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            session = req.session;
            room = req.body.room;

            if (session.user) {
              _context8.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context8.abrupt("return");

          case 5:
            if (room) {
              _context8.next = 8;
              break;
            }

            res.redirect("/messages/groupMessage");
            return _context8.abrupt("return");

          case 8:
            _context8.next = 10;
            return _messages.GroupMessageRoom.deleteOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(room)
              }, {
                masterEmail: session.user.email
              }]
            }).then(function (deleteOne) {
              if (deleteOne.deletedCount == 1) {
                res.redirect("/messages/groupMessage");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "삭제에 실패하였습니다");
              res.redirect("/messages/groupMessage");
            });

          case 10:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}()); // 그룹 체팅방

router.get("/groupMessageRoom", /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var session, room, group, messages;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            session = req.session;
            room = req.query.room;

            if (session.user) {
              _context9.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context9.abrupt("return");

          case 5:
            if (room) {
              _context9.next = 8;
              break;
            }

            res.redirect("/messages/groupMessage");
            return _context9.abrupt("return");

          case 8:
            _context9.next = 10;
            return _messages.GroupMessageRoom.findOne({
              $and: [{
                "roomMember.user": session.user.email
              }, {
                _id: (0, _mongoSanitize["default"])(room)
              }]
            }).select("\n        name\n        introduce\n        masterEmail\n        roomMember\n        ").populate("master", "email\n            nickname\n        ").exec()["catch"](function (err) {
              console.log(err);
              res.send("\n                <script>\n                    window.close()\n                </script>\n            ");
            });

          case 10:
            group = _context9.sent;

            if (!(group == null)) {
              _context9.next = 14;
              break;
            }

            res.redirect("/messages/groupMessage");
            return _context9.abrupt("return");

          case 14:
            if (!(group.master == null)) {
              _context9.next = 17;
              break;
            }

            res.redirect("/messages/groupMessage");
            return _context9.abrupt("return");

          case 17:
            _context9.next = 19;
            return _messages.GroupMessage.find({
              room: (0, _mongoSanitize["default"])(room)
            }).select("\n        from\n        from_email\n        message\n        ").populate("user", "\n            email\n            nickname\n            ").sort("time") // 최근이 아래
            .exec()["catch"](function (err) {
              console.log(err);
            });

          case 19:
            messages = _context9.sent;
            messages = messages.filter(function (element) {
              return element.user != null;
            });
            res.render("message/groupMessageRoom", {
              session: session,
              group: group,
              messages: messages
            });

          case 22:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x25, _x26, _x27) {
    return _ref9.apply(this, arguments);
  };
}());
module.exports = router;