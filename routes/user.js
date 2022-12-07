const dbLib = require('../db/dbFunction');
const validator = require('validator');

const {
    UserNotFoundError, UserFailedToUpdateError,
    UserFailedToCreateError, UserFailedToDeleteError,
    UserFailedToGetError,
} = require('../errors/userError');
const {ObjectNotFoundError} = require("../errors/databaseError");
const express = require("express");
const {UsernameNotMatchError} = require("../errors/loginError");

const router = express.Router();

router.get('/:username', async (req, res, next) => {
    try {
        if(!req.params.username){
            return next(new UserFailedToGetError("Missing username"));
        }else{
            const db = await dbLib.getDb();
            const results = await dbLib.getObjectByFilter(db, 'user', {username: req.params.username});
            if(results){
                res.status(200).json({
                    success: true,
                    data: results
                });
            }else{
                next(new UserNotFoundError("Wrong username"));
            }
        }
    } catch {
        next(new UserNotFoundError("User not found"));
    }
});

router.get('/search/:username', async (req, res, next) => {
    try {
        if(!req.params.username) return next(new UserFailedToGetError("Missing username"));

        const db = await dbLib.getDb();
        const results = await dbLib.getObjectsByFilter(db, 'user', {username: {$regex: req.params.username}});
        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new UserNotFoundError("User not found"));
    }
});

router.put('/:username', async (req, res, next) => {
    if (!req.body) {
        return next(new UserFailedToUpdateError("Missing user body"));
    }

    if (req.body.username !== req.decoded.username) {
        return next(new UsernameNotMatchError("You can only update your own account"));
    }

    try {
        const db = await dbLib.getDb();
        // check the req.body
        if (!req.body.username || !req.body.password || !req.body.email) {
            next(new UserFailedToUpdateError("Missing required fields. The required filed are username, password and email"));
        }

        if (!validator.isEmail(req.body.email)) next(new UserFailedToUpdateError("Invalid email"));

        const result = await dbLib.updateObjectByFilter(
            db, 'user',
            {username: req.params.username}, req.body
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        if (err instanceof ObjectNotFoundError) {
            next(new UserNotFoundError("User not found"));
        } else {
            next(new UserFailedToUpdateError("Failed to update user"));
        }
    }
});

router.delete('/:username', async (req, res, next) => {
    if (req.params.username !== req.decoded.username) {
        return next(new UsernameNotMatchError("You can only update your own account"));
    }

    try {
        const db = await dbLib.getDb();
        const results = await dbLib.deleteObjectByFilter(db, 'user', {username: req.params.username});
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err instanceof ObjectNotFoundError) {
            next(new UserFailedToDeleteError("User to be deleted not found"));
        } else {
            next(new UserFailedToDeleteError("User failed to delete"));
        }
    }
});

module.exports = router;
