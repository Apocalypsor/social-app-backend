const router = require('./index');

const dbLib = require('../db/dbFunction');
const {
    UserNotFoundError, UserFailedToUpdateError,
    UserFailedToCreateError, UserFailedToDeleteError
} = require('../errors/userError');
const {ObjectNotFoundError} = require("../errors/databaseError");


router.get('/user/:username', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.getObjectByFilter(db, 'user', {username: req.params.username});
        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new UserNotFoundError("User not found"));
    }
});

router.put('/user/:username', async (req, res, next) => {
    if (!req.body) {
        next(new UserFailedToUpdateError("Missing user body"));
    }

    try {
        const db = await dbLib.getDb();
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


router.post('/user', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.addObject(db, 'user', req.body);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new UserFailedToCreateError('User failed to create'));
    }
});

router.delete('/user/:username', async (req, res, next) => {
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
