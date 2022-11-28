const dbLib = require("../db/dbFunction");
const {CommentNotFoundError, CommentFailedToCreateError, CommentFailedToUpdateError, CommentFailedToDeleteError} = require("../errors/commentError");
const {ObjectNotFoundError} = require("../errors/databaseError");
const express = require("express");
const {LikeFailedToGetError} = require("../errors/likeError");

const router = express.Router();

router.get('/post/:postId', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        const post = await dbLib.getObjectByFilter(db, 'post', {_id: req.params.postId});
        if(!post) return next(new CommentNotFoundError('Post does not exist'));

        const results = await dbLib.getObjectsByFilter(db, 'comment', {
            postId: req.params.postId
        });

        res.status(200).json({
            success: true,
            data: results.sort((a, b) => a.updatedAt - b.updatedAt)
        });
    } catch {
        next(new CommentNotFoundError("Comment not found"));
    }
})

router.get('/:id', async (req, res, next) => {
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

router.post('/', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        if (req.body.postId && req.body.username) {

            const post = await dbLib.getObjectByFilter(db, 'post', {_id: req.body.postId});
            const username = await dbLib.getObjectByFilter(db, 'user', {username: req.body.username});
            if(!post || !username) return next(new CommentFailedToCreateError('Post or username does not exist'));


            const results = await dbLib.addObject(db, 'comment', req.body);
            res.status(200).json({
                success: true,
                data: results
            });
        } else {
            next(new CommentFailedToCreateError("Missing postId or username"));
        }
    } catch {
        next(new CommentFailedToCreateError("Comment failed to create"));
    }
})

router.put('/:id', async (req, res, next) => {
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

router.delete('/:id', async (req, res, next) => {
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