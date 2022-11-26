const {randomString} = require('../util/tool');
const express = require("express");
const dbLib = require("../db/dbFunction");
const jwt = require("jsonwebtoken");
const {LoginFailedError, LoginServerError} = require("../errors/loginError");

const router = express.Router();


const jwtSecret = randomString(32);

router.post('/login', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return next(new LoginFailedError('Username or password is missing'));
    }

    try {
        const {username, password} = req.body;
        const db = await dbLib.getDb();
        const user = await dbLib.getObjectByFilter(db, 'user', {username: username, password: password});
        if (user) {
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