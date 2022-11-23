const router = require('./index');

const dbLib = require('../db/dbFunction');
const {UserNotFoundError, UserFailedToUpdateError} = require('../error/userError');

/**
 *  User methods.
 */

/*
*     GET users.
*/

// Implement the GET /user endpoint
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
    } catch (err) {
        next(UserNotFoundError("User not found"));
    }
});

// Implement the GET /user/id endpoint
router.get('/user/:id', async (req, res, next) => {
    try {
        let db = await dbLib.getDb();
        const results = await dbLib.getObjectById(db, 'user', req.params.id);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        next(UserNotFoundError("User not found"));
    }
});

/**
 *  Put user given the id and userBody as a parameter.
 */
// implement the PUT /user/id endpoint
router.put('/user/:id', async (req, res, next) => {
    if (!req.body) {
        next(UserFailedToUpdateError("Missing user body"));
    }

    try {
        let db = await dbLib.getDb();
        const result = await dbLib.updateObjectById(db, 'user', req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(UserFailedToUpdateError("User failed to update"));
    }
});


// Implement the POST /user endpoint
router.post('/user', async (req, res) => {
    try {
        let db = await dbLib.getDb();
        const results = await dbLib.addObject(db, 'user', req.body);
        res.status(200).json({
            data: results
        });
    } catch (err) {
        res.status(404).json({message: 'there was an error.'});
    }
});

/**
 *
 *  Following methods.
 *
 */

// Implement the GET /following endpoint.
router.get('/following', async (req, res) => {
    console.log('Get following map.');
    try {
        // get the data from the db
        let results;
        if (!!req.query) {
            results = await dbLib.getObjectsByFilter(db, 'following', req.query);
        } else {
            results = await dbLib.getAll(db, 'following');
        }
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the GET /following/:followingId endpoint.
router.get('/following/:id', async (req, res) => {
    console.log('Get following map given the followingId as a parameter.');
    try {
        // get the data from the db
        const results = await dbLib.getObjectsById(db, 'following', req.params.id);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});


// Implement the DELETE /following endpoint
router.delete('/following/:id', async (req, res) => {
    console.log('Delete following map given followingMapId.');

    try {
        // get the data from the db
        const results = await dbLib.deleteObjectById(db, 'following', req.params.id);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the POST /following endpoint
router.post('/following', async (req, res) => {
    console.log('Create following item in map given followMapItem.');
    try {
        // get the data from the db
        const results = await dbLib.addObject(db, 'following', req.body.followMapItem);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the PUT /following endpoint
router.put('/following/:id', async (req, res) => {

    console.log('Update following item in map given followMapItem.');
    try {
        // get the data from the db
        const results = await dbLib.updateObjectById(db, 'following', req.params.id, req.body.followMapItem);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

/**
 *
 * Follower methods.
 *
 */
// Implement the GET /follower endpoint
router.get('/follower', async (req, res) => {
    console.log('Get followers given the followingId as query parameter');
    try {
        let results;
        if (!!req.query) {
            results = await dbLib.getObjectsByFilter(db, 'follower', req.query);
        } else {
            results = await dbLib.getAll(db, 'follower');
        }
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the GET /follower/:followerId endpoint
router.get('/follower/:followerId', async (req, res) => {
    console.log('Get followers given the followerId as a parameter');
    try {
        let results;
        if (!req.query.followingId) {
            const filterObj = {
                _id: req.params.followerId,
                followingId: req.query.followingId,
            }
            results = await dbLib.getObjectsByFilter(db, 'follower', filterObj);
        } else {
            results = await dbLib.getObjectById(db, 'follower', req.params.followerId);
        }
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the POST /follower endpoint
router.post('/follower', async (req, res) => {
    console.log('Create follower item in map given followerMapItem.');
    try {
        // get the data from the db
        const results = await dbLib.addObject(db, 'follower', req.body.followerMapItem);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the DELETE /follower/:followingId endpoint
router.delete('/follower/:followerId', async (req, res) => {
    console.log('Delete follower map given followerId.');
    try {
        // get the data from the db
        const results = await dbLib.deleteObjectById(db, 'follower', req.params.followerId);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the PUT /follower/:followerId endpoint
router.put('/follower/:followerId', async (req, res) => {

    console.log('Update follower item in map given followerMapItem.');
    try {
        // get the data from the db
        const results = await dbLib.updateObjectById(db, 'follower', req.params.followerId, req.body.followerMapItem);
        // send the response with the appropriate status code
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }

});


/**
 *
 * Like Map methods.
 *
 */

// Implement the GET /like endpoint
router.get('/like', async (req, res) => {
    console.log('Get likes map item.');
    try {
        let results;
        if (!!req.query) {
            results = await dbLib.getObjectsByFilter(db, 'like', req.query);
        } else {
            results = await dbLib.getAll(db, 'like');
        }
        res.status(200).json({data: results});

    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});


// Implement the GET /like/:likeId endpoint
router.get('/like/:likeId', async (req, res) => {
    console.log('Get like map item given likeId.');
    try {
        const results = await dbLib.getObjectById(db, 'like', req.params.likeId);
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the POST /like endpoint
router.post('/like', async (req, res) => {
    console.log('Create like map item given likeMapItem.');
    try {
        const results = await dbLib.addObject(db, 'like', req.body.likeMapItem);
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the DELETE /like/:likeId endpoint
router.delete('/like/:likeId', async (req, res) => {
    console.log('Delete like map item given likeId.');
    try {
        const results = await dbLib.deleteObjectById(db, 'like', req.params.likeId);
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the PUT /like/:likeId endpoint
router.put('/like/:likeId', async (req, res) => {

    console.log('Update like map item given likeMapItem.');
    try {
        const results = await dbLib.updateObjectById(db, 'like', req.params.likeId, req.body.likeMapItem);
        res.status(200).json({data: results});
    } catch (err) {
        res.status(404).json({message: 'there was error.'});
    }
});


module.exports = router;
