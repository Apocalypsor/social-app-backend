let router = requires('./index');
const dbLib = require('./dbFunctions');

let db = require('../app.js');

/**
 * 
 * Post methods.
 * 
*/

// Implement the GET /post endpoint
router.get('/post', async (req, res) => {
    console.log('Get post given username as query parameter');
    try {
        // get the data from the db
        let results;
        if(!!req.query) {
            results = await dbLib.getObjectsByFilter(db, 'post', req.query);
        }else{
            results = await dbLib.getAll(db, 'post');
        }
        res.status(200).json({ data: results });
    }catch(err){
        res.status(404).json({message: 'there was error.'});
    }
});

// Implement the GET /post/id endpoint
router.get('/post/:id', async (req, res) => {
    console.log('Get post given the id as a parameter');
    try {
        const results = await dbLib.getObjectById(db, 'post', req.params.id);
        res.status(200).json({ data: results });
    }catch(err){
        res.status(404).json({ message: 'there was error.' });
    }
});

// Implement the POST /post endpoint
router.post('/post', async (req, res) => {
    console.log('Create a new post');
    try {
        if(!!req.body){
            const results = await dbLib.createObject(db, 'post', req.body.postBody);
            res.status(200).json({ data: results });
        }else{
            res.status(404).json({ message: 'Empty postBody.' });
        }
    }catch(err){
        res.status(404).json({ message: 'there was error.' });
    }
});

// Implement the PUT /post/id endpoint
router.put('/post/:id', async (req, res) => {
    console.log('UPDATE a post given the id and postBody as parameters.');
    try {
        if(!!req.body && !!req.params.id){
            const results = await dbLib.updateObjectById(db, 'post', req.params.id, req.body.postBody);
            res.status(200).json({ data: results });
        }else{
            res.status(404).json({ message: 'Empty postBody or empty id.' });
        }
    }catch(err){
        res.status(404).json({ message: 'there was error.' });
    }
});

// Implement the DELETE /post/id endpoint
router.delete('/post/:id', async (req, res) => {
    console.log('DELETE a post given the id as a parameter.');
    try {
        if(!!req.params.id){
            const results = await dbLib.deleteObjectById(db, 'post', req.params.id);
            res.status(200).json({ data: results });
        }else{
            res.status(404).json({ message: 'Empty id.' });
        }
    }catch(err){
        res.status(404).json({ message: 'there was error.' });
    }
});





module.exports = router;
