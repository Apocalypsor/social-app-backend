const dbLib = require("../db/dbFunction");
const {LikeFailedToGetError} = require("../errors/likeError");
const express = require("express");
const {UsernameNotMatchError} = require("../errors/loginError");

const router = express.Router();

router.get('/is-like/:likeUsername/:postId', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let isLike = await dbLib.getObjectByFilter(
            db, 'like',
            {userLike: req.params.likeUsername, postId: req.params.postId}
        );

        res.status(200).json({
            success: true,
            data: !!isLike
        });
    } catch {
        next(new LikeFailedToGetError('Failed to get like status'));
    }
});

router.get('/count/:postId', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        const count = await dbLib.getObjectsByFilter(
            db, 'like',
            {postId: req.params.postId}
        );

        res.status(200).json({
            success: true,
            data: count.length
        });
    } catch {
        next(new LikeFailedToGetError('Failed to get like status'));
    }
});

router.post('/like', async (req, res, next) => {
    if (!req.body.postId || !req.body.userLike) {
        return next(new LikeFailedToGetError('Missing required fields'));
    }

    if (req.body.userLike !== req.decoded.username) {
        return next(new UsernameNotMatchError("You can't like this post"));
    }

    try {
        const db = await dbLib.getDb();

        const post = await dbLib.getObjectByFilter(db, 'post', {_id: req.body.postId});
        const username = await dbLib.getObjectByFilter(db, 'user', {username: req.body.userLike});
        if (!post || !username) return next(new LikeFailedToGetError('Post or username does not exist'));

        let existed = await dbLib.getObjectByFilter(
            db, 'like',
            {postId: req.body.postId, userLike: req.body.userLike}
        );

        if (!existed) {
            await dbLib.addObject(db, 'like', {
                postId: req.body.postId,
                userLike: req.body.userLike
            });
        }

        res.status(200).json({
            success: true,
            data: true
        });
    } catch {
        next(new LikeFailedToGetError('Failed to like'));
    }
});

router.post('/unlike', async (req, res, next) => {
    if (!req.body.postId || !req.body.userLike) {
        return next(new LikeFailedToGetError('Missing required fields'));
    }

    if (req.body.userLike !== req.decoded.username) {
        return next(new UsernameNotMatchError("You can't unlike this post"));
    }

    try {
        const db = await dbLib.getDb();

        const post = await dbLib.getObjectByFilter(db, 'post', {_id: req.body.postId});
        const username = await dbLib.getObjectByFilter(db, 'user', {username: req.body.userLike});
        if (!post || !username) return next(new LikeFailedToGetError('Post or username does not exist'));


        let existed = await dbLib.getObjectByFilter(
            db, 'like',
            {postId: req.body.postId, userLike: req.body.userLike}
        );

        if (existed) {
            await dbLib.deleteObjectById(db, 'like', existed._id);
        }else{
            return next(new LikeFailedToGetError('Post is not liked'));
        }

        res.status(200).json({
            success: true,
            data: true
        });
    } catch {
        next(new LikeFailedToGetError('Failed to unlike'));
    }
});


module.exports = router;