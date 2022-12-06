const express = require('express');
const dbLib = require('../db/dbFunction');
const jwt = require('jsonwebtoken');
const {LoginFailedError, LoginServerError} = require('../errors/loginError');
const {getJwtSecret} = require("../util/tool");
const bouncer = require('express-bouncer')(10000, 20000, 3);


const router = express.Router();
const jwtSecret = getJwtSecret();

bouncer.blocked = function (req, res, next, remaining) {
    console.log("Too many requests have been made, " +
        "please wait " + remaining / 1000 + " seconds");
    res.status(429).send("Too many requests have been made, " +
        "please wait " + remaining / 1000 + " seconds");
}


router.post('/login', bouncer.block, async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return next(new LoginFailedError('Username or password is missing'));
    }

    try {
        const {username, password} = req.body;
        const db = await dbLib.getDb();
        const user = await dbLib.getObjectByFilter(db, 'user', {username: username, password: password});
        if (user) {
            // reset the bouncer
            bouncer.reset(req);

            // Create token and send it to client
            const token = jwt.sign({
                username: username
            }, jwtSecret, {expiresIn: '6h'});
            res.json({
                success: true,
                data: {
                    profilePicture: user.profilePicture,
                    token: token
                }
            });
        } else {
            next(new LoginFailedError('Invalid username or password'));
        }
    } catch {
        next(new LoginServerError('Server Error'));
    }
});

module.exports = router;
