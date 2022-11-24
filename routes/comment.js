const router = require("./index");
const dbLib = require("../db/dbFunction");
const {CommentNotFoundError, CommentFailedToCreateError, CommentFailedToUpdateError, CommentFailedToDeleteError} = require("../errors/commentError");
const {ObjectNotFoundError} = require("../errors/databaseError");


router.get('/comment/post/:postId', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.getObjectsByFilter(db, 'comment', {
            postId: req.params.postId
        });

        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new CommentNotFoundError("Comment not found"));
    }
})

router.get('/comment/:id', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.getObjectById(db, 'comment', req.params.id);

        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new CommentNotFoundError("Comment not found"));
    }
})

router.post('/comment', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        if(req.body.postId) {
            const results = await dbLib.addObject(db, 'comment', req.body);
            res.status(200).json({
                success: true,
                data: results
            });
        }else{
            next(new CommentFailedToCreateError("Missing postId"));
        }
    } catch {
        next(new CommentFailedToCreateError("Comment failed to create"));
    }
})

router.put('/comment/:id', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.updateObjectById(db, 'comment', req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
        next(new CommentFailedToUpdateError("Comment failed to update"));
    }
})

router.delete('/comment/:id', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.deleteObjectById(db, 'comment', req.params.id);

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        if (err instanceof ObjectNotFoundError) {
            next(err);
        } else {
            next(new CommentFailedToDeleteError("Comment failed to delete"));
        }
    }
})

module.exports = router;