import csrf from "csurf";
import timeout from "express-timeout-handler";
import rateLimit from "express-rate-limit";

export const csrfProtection = csrf({ cookie: true });

export const timeoutModule = timeout.handler({
    timeout: 3000,
    onTimeout: function (req, res) {
        res.status(503).send("요청이 지연되고 있습니다. 이 오류가 계속되면 관리자에게 문의해주세요");
    },
    disable: ["write", "setHeaders", "send", "json", "end"],
});

export const rateLimitModule = rateLimit({
    windowMs: 1 * 60 * 1000, // 1min
    max: 20 * 100,
});
