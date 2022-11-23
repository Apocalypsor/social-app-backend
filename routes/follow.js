const router = require("./index");
const dbLib = require("../db/dbFunction");
const {FollowerFailedToGetError} = require("../errors/followError");

router.get('/follower/follower-names/:id', async (req, res, next) => {
    try {
        let db = await dbLib.getDb();
        let follower = await dbLib.getObjectsByFilter(db, 'follow', {followerId: req.params.id});

        let followerNames = [];
        for (let f of follower) {
            let user = await dbLib.getObjectById(db, 'user', f.followingId);
            followerNames.push(user.username);
        }

        res.status(200).json({
            success: true,
            data: followerNames
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get follower names'));
    }
});

module.exports = router;



