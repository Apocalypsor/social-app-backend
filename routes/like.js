const router = require("./index");
const dbLib = require("../db/dbFunction");
const {LikeFailedToGetError} = require("../errors/likeError");

router.get('/like/is-like/:likeUsername/:postId', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let isLike = await dbLib.getObjectByFilter(
            db, 'like',
            {'userLike': req.params.likeUsername, 'postId': req.params.postId}
        );

        res.status(200).json({
            success: true,
            data: !!isLike
        });
    } catch {
        next(new LikeFailedToGetError('Failed to get following status'));
    }
});

router.post('/like/like', async (req, res, next) => {
    if (!req.body.postId || !req.body.userLike) {
        next(new LikeFailedToGetError('Missing required fields'));
        return;
    }

    try {
        const db = await dbLib.getDb();

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

router.post('/like/unlike', async (req, res, next) => {
    if (!req.body.postId || !req.body.userLike) {
        next(new LikeFailedToGetError('Missing required fields'));
        return;
    }

    try {
        const db = await dbLib.getDb();

        let existed = await dbLib.getObjectByFilter(
            db, 'like',
            {postId: req.body.postId, userLike: req.body.userLike}
        );

        if (existed) {
            await dbLib.deleteObjectById(db, 'like', existed._id);
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