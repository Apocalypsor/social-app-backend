const fs = require("fs");

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function unless(path, method, middleware) {
    function check(req, path, method) {
        if (path instanceof RegExp) {
            return path.test(req.path) && (method === req.method || method === '*');
        }

        return req.path.startsWith(path) && (method === req.method || method === '*');
    }

    return function (req, res, next) {
        if (path instanceof String || path instanceof RegExp) {
            if (check(req, path, method)) return next();
        } else if (path instanceof Array) {
            for (let i = 0; i < path.length; i++) {
                if (check(req, path[i], method[i])) return next();
            }
        }

        return middleware(req, res, next);
    };
}

function checkJwtSecret() {
    if (!process.env.JWT_SECRET) {
        console.log('JWT_SECRET is not set');
        const secret = randomString(32);
        fs.appendFileSync('.env', 'JWT_SECRET=' + secret);
        process.env.JWT_SECRET = secret;
        console.log('Generated new JWT_SECRET');
    }
}

module.exports = {randomString, unless, checkJwtSecret};
