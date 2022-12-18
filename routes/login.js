const express = require('express');
const dbLib = require('../db/dbFunction');
const jwt = require('jsonwebtoken');
const {UserFailedToUpdateError, UserFailedToCreateError} = require("../errors/userError");
const validator = require("validator");
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
                    username: username,
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


router.post('/register', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        // check the req.body
        if (!req.body.username || !req.body.password || !req.body.email) {
            next(new UserFailedToUpdateError("Missing required fields. The required filed are username, password and email"));
        }

        if (!validator.isEmail(req.body.email)) next(new UserFailedToUpdateError("Invalid email"));
        const results = await dbLib.addObject(db, 'user', req.body);

        // token
        // Create token and send it to client
        const token = jwt.sign({
            username: req.body.username
        }, jwtSecret, {expiresIn: '6h'});

        res.json({
            success: true,
            data: {
                username: req.body.username,
                profilePicture: results.profilePicture,
                token: token
            }
        });
    } catch {
        next(new UserFailedToCreateError('User failed to create'));
    }
});


module.exports = router;
