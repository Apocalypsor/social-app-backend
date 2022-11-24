const router = require("./index");
const dbLib = require("../db/dbFunction");
const {FollowerFailedToGetError} = require("../errors/followError");
const {getObjectsByFilter} = require("../db/dbFunction");
const shuffle = require('shuffle-array');

router.get('/follow/follower-names/:username', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let followerNames = await dbLib.getObjectsByFilter(db, 'follow', {following: req.params.username});
        res.status(200).json({
            success: true,
            data: followerNames.map(user => user.follower)
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get follower names'));
    }
});

router.get('/follow/follow-count/:username', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let followCount = await dbLib.getObjectsByFilter(db, 'follow', {following: req.params.username});

        res.status(200).json({
            success: true,
            data: followCount.length
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get follower count'));
    }
});

router.get('/follow/is-following/:followerUsername/:followingUsername', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();

        let isFollowing = await dbLib.getObjectByFilter(
            db, 'follow',
            {follower: req.params.followerUsername, following: req.params.followingUsername}
        );

        res.status(200).json({
            success: true,
            data: !!isFollowing
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get following status'));
    }
});

router.post('/follow/follow', async (req, res, next) => {
    if (!req.body.follower || !req.body.following) {
        next(new FollowerFailedToGetError('Missing follower or following'));
        return;
    }

    try {
        const db = await dbLib.getDb();

        let existed = await dbLib.getObjectByFilter(
            db, 'follow',
            {follower: req.body.follower, following: req.body.following}
        );

        if (!existed) {
            await dbLib.addObject(db, 'follow', {
                follower: req.body.follower,
                following: req.body.following
            });
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
    if (!req.body.follower || !req.body.following) {
        next(new FollowerFailedToGetError('Missing follower or following'));
        return;
    }

    try {
        const db = await dbLib.getDb();

        let existed = await dbLib.getObjectByFilter(
            db, 'follow',
            {follower: req.body.follower, following: req.body.following}
        );

        if (existed) {
            await dbLib.deleteObjectById(db, 'follow', existed._id);
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
        const currentUser = req.params.username;
        const following = await dbLib.getObjectsByFilter(db, 'follow', {follower: currentUser});
        const followingIds = new Set(following.map(follow => follow.following));

        const followingFollower = new Set(
            await getObjectsByFilter(db, 'follow', {following: {$in: [...followingIds]}})
        );

        const followingFollowerUsername = shuffle([...followingFollower].map(follow => follow.follower));


        for (let followerUsername of followingFollowerUsername) {
            if (currentUser !== followerUsername) {
                const followerFollowingIds = new Set(
                    [...followingFollower].filter(
                        follow => follow.follower === followerUsername
                    ).map(follow => follow.following)
                );

                const intersection = new Set([...followerFollowingIds].filter((x) => followingIds.has(x)));

                if (intersection.size >= 3) {
                    if (!followingIds.has(followerUsername) && !checkId.has(followerUsername)) {
                        checkId.add(followerUsername);
                        finalArray.push(followerUsername);
                        if (finalArray.length === 5) {
                            break;
                        }
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            data: finalArray
        });
    } catch {
        next(new FollowerFailedToGetError('Failed to get suggestions'));
    }
});

module.exports = router;



