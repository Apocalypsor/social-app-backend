const router = require('./index');

const dbLib = require('../db/dbFunction');
const {
    UserNotFoundError, UserFailedToUpdateError,
    UserFailedToCreateError, UserFailedToDeleteError
} = require('../errors/userError');


router.get('/user', async (req, res, next) => {
    try {
        let db = await dbLib.getDb();
        let result;
        if (req.query.username) {
            result = await dbLib.getObjectsByFilter(db, 'user', {username: req.query.username});
        } else {
            result = await dbLib.getObjects(db, 'user');
        }
        res.status(200).json({
            success: true,
            data: result
        });
    } catch {
        next(new UserNotFoundError("User not found"));
    }
});

router.get('/user/:id', async (req, res, next) => {
    try {
        let db = await dbLib.getDb();
        const results = await dbLib.getObjectById(db, 'user', req.params.id);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new UserNotFoundError("User not found"));
    }
});

router.put('/user/:id', async (req, res, next) => {
    if (!req.body) {
        next(new UserFailedToUpdateError("Missing user body"));
    }

    try {
        let db = await dbLib.getDb();
        const result = await dbLib.updateObjectById(db, 'user', req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch {
        next(new UserFailedToUpdateError("User failed to update"));
    }
});


router.post('/user/', async (req, res, next) => {
    try {
        let db = await dbLib.getDb();
        const results = await dbLib.addObject(db, 'user', req.body);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new UserFailedToCreateError("User failed to create"));
    }
});

router.delete('/user/:id', async (req, res, next) => {
    try {
        let db = await dbLib.getDb();
        const results = await dbLib.deleteObjectById(db, 'user', req.params.id);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err instanceof UserNotFoundError) {
            next(new UserFailedToDeleteError("User to be deleted not found"));
        } else {
            next(new UserFailedToDeleteError("User failed to delete"));
        }
    }
});

module.exports = router;
