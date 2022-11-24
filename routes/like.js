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

module.exports = router;