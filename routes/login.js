const express = require('express');
const dbLib = require('../db/dbFunction');
const jwt = require('jsonwebtoken');
const {LoginFailedError, LoginServerError, ToManyFailedError} = require('../errors/loginError');
const bouncer = require('express-bouncer')(10000, 20000, 3);


const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

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

    if (bouncer.remaining > 0) bouncer.blocked(req, res, next, bouncer.remaining);

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
            bouncer.block(req, res, () => next(new LoginFailedError('Invalid username or password')));
            // next(new LoginFailedError('Invalid username or password'));
        }
    } catch {
        console.log("server error");
        bouncer.block(req, res, () => next(new LoginServerError('Server error')));
        // next(new LoginServerError('Server Error'));
    }
});

module.exports = router;
