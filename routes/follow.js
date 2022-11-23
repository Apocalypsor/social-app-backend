const router = require("./index");
const dbLib = require("../db/dbFunction");
const {FollowerFailedToGetError} = require("../errors/followError");
const {ObjectId} = require("mongodb");

router.get('/follow/follower-names/:username', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let followerNames = await dbLib.getFollowerNamesByUsername(db, req.params.username);
        res.status(200).json({
            success: true,
            data: followerNames
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get follower names'));
    }
});

router.get('/follow/follow-count/:username', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let followCount = await dbLib.getFollowCountByUsername(db, req.params.username);
        res.status(200).json({
            success: true,
            data: followCount
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get follower count'));
    }
});

router.get('/follow/is-following/:followerUsername/:followingUsername', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let isFollowing = await dbLib.getFollowStatusByUsername(
            db, req.params.followerUsername, req.params.followingUsername
        );

        res.status(200).json({
            success: true,
            data: isFollowing
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get following status'));
    }
});

router.post('/follow/follow', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let existed = await dbLib.getFollowStatusByUsername(
            db, req.body.follower, req.body.following
        );

        if (!existed) {
            await dbLib.postFollowByUsername(db, req.body.follower, req.body.following);
        }

        res.status(200).json({
            success: true,
            data: true
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to follow'));
    }
});

router.post('/follow/unfollow', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let existed = await dbLib.getFollowStatusByUsername(
            db, req.body.follower, req.body.following
        );

        if (existed) {
            await dbLib.postUnfollowByUsername(db, req.body.follower, req.body.following);
        }

        res.status(200).json({
            success: true,
            data: true
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to unfollow'));
    }
});

router.get('/suggestions/:username', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        const finalArray = [];
        const checkId = new Set();
        const currentUser = await dbLib.getObjectByFilter(db, 'user', {username: req.params.username});
        const following = await dbLib.getObjectsByFilter(db, 'follow', {followerId: currentUser._id});
        const followingIds = new Set(following.map(follow => follow.followingId.toString()));

        const followingFollower = new Set((await db.collection('follow').aggregate([
            {
                $match: {
                    followingId: {
                        $in: [...followingIds].map(id => ObjectId(id))
                    }
                }
            },
            {
                $project: {
                    followerId: 1
                }
            }
        ]).toArray()).map(follower => follower.followerId.toString()));

        for (let follower of followingFollower) {
            if (currentUser._id.toString() !== follower) {
                const followerFollowingIds = new Set(
                    (await dbLib.getObjectsByFilter(db, 'follow', {followerId: ObjectId(follower)}))
                        .map(follow => follow.followingId.toString())
                );

                const intersection = new Set([...followerFollowingIds].filter((x) => followingIds.has(x)));

                if (intersection.size >= 3) {
                    if (!followingIds.has(follower) && !checkId.has(follower)) {
                        checkId.add(follower);
                        finalArray.push(ObjectId(follower));
                        if (finalArray.length === 5) {
                            break;
                        }
                    }
                }
            }
        }

        const suggestions = await dbLib.getObjectsByFilter(db, 'user', {_id: {$in: finalArray}});
        res.status(200).json({
            success: true,
            data: suggestions.map(suggestion => suggestion.username)
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get suggestions'));
    }
});

module.exports = router;



