var express = require("express");
var router = express.Router();
import sanitize from "mongo-sanitize";
import { Community, Comment } from "../models/communities";
import { datetimeToString, getTag } from "../../utils";
import { upload } from "../../multer";
import { csrfProtection } from "../../middleware";

router.get("/", async (req, res, next) => {
    res.redirect("/");
});

// 목록

router.get("/list", async (req, res, next) => {
    const { session } = req;
    const { page, tag, key, value } = req.query;

    const show = req.flash("show");
    const message = req.flash("message");

    let query = {
        tag: {
            $ne: "공지",
        },
    };

    if (tag) {
        // 태그 조건
        query = {
            tag: getTag(tag),
        };
    } else {
        // 검색 조건
        if (key == "title") {
            query = {
                $and: [
                    {
                        tag: {
                            $ne: "공지",
                        },
                    },
                    {
                        title: {
                            $regex: `.*${sanitize(value)}.*`,
                        },
                    },
                ],
            };
        }
    }

    // 검색

    const communities = await Community.paginate(
        query,
        {
            select: "_id writerEmail tag title time recommends",
            page: page || 1,
            limit: 15,
            sort: {
                time: "desc",
            },
            populate: {
                path: "writer",
                select: `
                email
                nickname
                server
                `,
                model: "User",
            },
        },
        {}
    )
        .then((communities) => {
            communities.docs = communities.docs.filter((element) => {
                let idx = 0;
                element.recommends.forEach((element) => {
                    if (element.like == false) {
                        idx++;
                    }
                });

                element.recommends = element.recommends.filter((element) => element.like == true);

                return element.writer != null && idx < 20;
            });

            if (key == "nickname") {
                communities.docs = communities.docs.filter((element) => element.writer.nickname.includes(sanitize(value)));
            } else if (key == "email") {
                communities.docs = communities.docs.filter((element) => element.writer.email.includes(sanitize(value)));
            }
            return communities;
        })
        .catch((err) => {
            console.log(err);
        });

    // 공지 찾기

    const alerts = await Community.find({
        tag: {
            $eq: "공지",
        },
    })
        .select("_id writerEmail title time recommends")
        .populate(
            "writer",
            `
            email
            nickname
            server
            profile
            bio
            is_admin
        `
        )
        .limit(5)
        .sort("-time")
        .exec()
        .then((alerts) => {
            alerts = alerts.filter((element) => element.writer != null);
            return alerts;
        })
        .catch((err) => {
            console.log(err);
        });

    if (page > communities.totalPages) {
        res.redirect(`/communities/list?page=${communities.totalPages}`);
    } else {
        res.render("community/list", { session: session, communities: communities, alerts: alerts, show: show, message: message });
    }
});

// 새 글쓰기

router.get("/new", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    res.render("community/new", { session: session, csrfToken: csrfToken });
});

router.post("/new", upload.single("inputFile"), csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { tag, title, content } = req.body;
    const { file } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin != true && tag == "공지") {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    await Community.create({
        writerEmail: session.user.email,
        tag: sanitize(tag),
        title: sanitize(title),
        content: sanitize(content),
        file: Boolean(file) ? sanitize(file.filename) : null,
    })
        .then((newCommunity) => {
            if (newCommunity == null) {
                throw Error();
            }
            res.redirect(`/communities/detail?id=${newCommunity._id}`);
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

// 글보기

router.get("/detail", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    const detail = await Community.findOne({
        _id: sanitize(id),
    })
        .select(
            `
        _id
        writerEmail
        tag
        title
        content
        file
        time
        recommends
    `
        )
        .populate(
            "writer",
            `
        email
        nickname
        server
        profile
        bio
        `
        )
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (detail == null) {
        req.flash("show", "true");
        req.flash("message", "알 수 없는 오류가 발생했습니다");
        res.redirect("/communities/list");
        return;
    }

    const like = detail.recommends.filter((element) => element.like == true);
    const dislike = detail.recommends.filter((element) => element.like == false);

    const more = await Community.find({
        $and: [
            {
                writerEmail: detail.writer.email,
            },
            {
                tag: {
                    $ne: "공지",
                },
            },
            {
                _id: {
                    $ne: detail._id,
                },
            },
        ],
    })
        .select("_id title time")
        .sort("-time")
        .limit(7)
        .exec()
        .catch((err) => {
            console.log(err);
        });

    const comments = await Comment.find({
        noticeId: id,
    })
        .populate(
            "writer",
            `
        email
        nickname
        server
        profile
        bio
        `
        )
        .sort("time")
        .exec()
        .then((comment) => {
            comment = comment.filter((element) => element.writer != null);
            return comment;
        })
        .catch((err) => {
            console.log(err);
        });

    res.render("community/detail", { session: session, detail: detail, more: more, like: like, dislike: dislike, comments: comments, csrfToken: csrfToken });
});

// 글 수정

router.get("/updatePost", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    await Community.findOne({
        $and: [{ _id: sanitize(id) }, { writerEmail: sanitize(session.user.email) }],
    })
        .then((targetPost) => {
            if (targetPost == null) {
                throw Error();
            }
            res.render("community/updatePost", { session, session, post: targetPost, csrfToken: csrfToken });
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

router.post("/updatePost", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { tag, title, content, id } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await Community.updateOne(
        {
            $and: [
                {
                    writerEmail: session.user.email,
                },
                {
                    _id: sanitize(id),
                },
            ],
        },
        {
            $set: {
                tag: sanitize(tag),
                title: sanitize(title),
                content: sanitize(content),
            },
        }
    )
        .then((updatedPost) => {
            if (updatedPost.nModified == 1) {
                res.redirect(`/communities/detail?id=${id}`);
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

// 글 삭제

router.get("/deletePost", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    res.render("community/deletePost", { id: id, csrfToken: csrfToken });
});

router.post("/deletePost", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    await Community.deleteOne({
        $and: [
            {
                writerEmail: sanitize(session.user.email),
            },
            {
                _id: sanitize(id),
            },
        ],
    })
        .then((deletedPost) => {
            if (deletedPost.deletedCount == 1) {
                req.flash("show", "true");
                req.flash("message", "삭제를 완료하였습니다");
                res.redirect("/communities/list");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생하였습니다");
            res.redirect("/communities/list");
        });
});

// 추천하기

router.get("/recommendPost", async (req, res, next) => {
    const { session } = req;
    const { id, like } = req.query;

    let action;
    let success = false;
    let method = null;

    if (!session.user || !id || !like) {
        res.json({
            success,
            method,
        });
        return;
    }

    const recommendPost = await Community.findOne({
        $and: [
            {
                _id: sanitize(id),
            },
            {
                "recommends.recommender": session.user.email,
            },
        ],
    })
        .select("_id")
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (recommendPost == null) {
        // 지금까지 한 적 없음
        method = "push";
        action = {
            $push: {
                recommends: {
                    recommender: session.user.email,
                    like: like == "true" ? true : false,
                },
            },
        };
    } else {
        // 한 적 있음
        method = "pull";
        action = {
            $pull: {
                recommends: {
                    recommender: session.user.email,
                },
            },
        };
    }

    await Community.updateOne(
        {
            $and: [
                {
                    _id: sanitize(id),
                },
            ],
        },
        action
    )
        .then((updatedPost) => {
            if (updatedPost.nModified == 1) {
                res.json({
                    success: true,
                    method: method,
                });
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            res.json({
                success: false,
                method: method,
            });
        });
});

// 댓글쓰기

router.post("/newComment", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { noticeId, content } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!noticeId || !content) {
        req.flash("show", "true");
        req.flash("show", "알 수 없는 오류가 발생했습니다");
        res.redirect("/communities/list");
        return;
    }

    await Comment.create({
        writerEmail: session.user.email,
        noticeId: sanitize(noticeId),
        content: sanitize(content),
    })
        .then((newComment) => {
            if (newComment === null) {
                throw Error();
            }
            res.redirect(`/communities/detail?id=${noticeId}`);
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("show", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

// 댓글 삭제(수정)

router.get("/deleteComment", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    res.render("community/deleteComment", { id: id, csrfToken: csrfToken });
});

router.post("/deleteComment", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    const comment = await Comment.findOne({
        _id: sanitize(id),
    })
        .select("noticeId")
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (comment == null) {
        req.flash("show", "true");
        req.flash("show", "알 수 없는 오류가 발생했습니다");
        res.redirect("/communities/list");
        return;
    }

    await Comment.updateOne(
        {
            $and: [
                {
                    _id: sanitize(id),
                },
                {
                    writerEmail: session.user.email,
                },
            ],
        },
        {
            $set: {
                is_deleted: true,
            },
        }
    )
        .then((updatedComment) => {
            if (updatedComment.nModified == 1) {
                res.redirect(`/communities/detail?id=${comment.noticeId}`);
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

module.exports = router;
