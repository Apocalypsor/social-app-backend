const router = require('./index');

const dbLib = require('../db/dbFunction');
const {
    PostNotFoundError,
    PostFailedToDeleteError,
    PostFailedToCreateError,
    PostFailedToUpdateError
} = require('../errors/postError');
const {ObjectNotFoundError} = require("../errors/databaseError");



/**
 * 
 * Post methods.
 * 
*/

// Implement the GET /post/username/:username endpoint
router.get('/post/username/:username', async (req, res, next) => {

    try {
        // get the data from the db
        const db = await dbLib.getDb();

        let results;
        if(req.params.username) {
            results = await dbLib.getObjectsByFilter(db, 'post', {username: req.params.username});
            res.status(200).json({
                success: true,
                data: results
            });
        }else{
            next(new PostNotFoundError("Missing username."))
        }
    }catch{
        next(new PostNotFoundError("Post not found"));
    }
});

// Implement the GET /post/id endpoint
router.get('/post/:id', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.getObjectById(db, 'post', req.params.id);

        console.log("results: ", results);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch {
       next(new PostNotFoundError("Post not found"));
    }
});

// Implement the GET /post endpoint
router.get('/post', async (req, res, next) => {
    try{
        const db = await dbLib.getDb();
        const results = await dbLib.getObjects(db, 'post');
        res.status(200).json({
            success: true,
            data: results
        });
    }catch {
        next(new PostNotFoundError("Post not found"));
    }
});

// Implement the GET /post/page/:page endpoint
router.get('/post/page/:page', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        if(req.params.page){
            const limitNum = req.query["_limit"] === undefined ? 5: req.query["_limit"];
            const order = req.query["_order"] === undefined ? -1 : req.query["_order"];
            const option = {
                sort: {'updatedAt': order === 'asc' ? 1 : -1},
            }
            const pageObj = {
                skipNum: (req.params.page - 1) * limitNum,
                limitNum: parseInt(limitNum)
            }

            const results = await dbLib.getObjectsByFilterOptionAndPage(db, 'post', {}, option, pageObj);
            res.status(200).json({
                success: true,
                data: results
            });
        }else{
            next(new PostNotFoundError("Missing page number."));
        }
    }catch{
       next(new PostNotFoundError("Post not found"));
    }

});



// Implement the POST /post endpoint
router.post('/post', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        if(req.body){
            const results = await dbLib.addObject(db, 'post', req.body);
            res.status(200).json({
                success: true,
                data: results
            });
        }else{
            next(new PostFailedToCreateError("Missing post body"));
        }
    }catch{
        next(new PostFailedToCreateError("Post failed to create."));
    }
});

// Implement the PUT /post/id endpoint
router.put('/post/:id', async (req, res, next) => {
    if(!req.body){
        next(new PostFailedToUpdateError("Missing post body"));
    }
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.updateObjectById(db, 'post', req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: results
        });
    }catch(err){
        if(err instanceof ObjectNotFoundError){
            next(new PostNotFoundError("Post not found"));
        }else{
            next(new PostFailedToUpdateError("Failed to update post."));
        }
    }
});


// Implement the DELETE /post/id endpoint
router.delete('/post/:id', async (req, res, next) => {
    try {
        const db = await dbLib.getDb();
        const results = await dbLib.deleteObjectById(db, 'post', req.params.id);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err){
        if(err instanceof ObjectNotFoundError){
            next(new PostFailedToDeleteError("Post to be deleted not found."))
        }else {
            next(new PostFailedToDeleteError("Post failed to delete."));
        }
    }
});


module.exports = router;
