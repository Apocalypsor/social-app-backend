const e = require('express');
let express = require('express');
let router = express.Router();

const dbLib = require('./dbFunctions');

let db = require('../app.js');



/**
 *  User methods.
*/

/*
*     GET users.
*/

// Implement the GET /user endpoint
router.get('/user', async (req, res) => {
  console.log('Get user given username as query parameter');
  try {
    // get the data from the db
    let result;
    if(req.query.username) results = await dbLib.getObjectsByFilter(db, 'user', req.query.username);
    else if (req.query.id) results = await dbLib.getObjectById(db, 'user', req.query.id);
    
    // send the response with the appropriate status code
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was error.' });
  }
});

// Implement the GET /user/id endpoint
router.get('/user/:id', async(req, res)=>{
  console.log('Get user given the id as a parameter');
  try{
    const results = await dbLib.getObjectById(db, 'user', req.params.id);
    res.status(200).json({data: results});
  } catch(err){
    res.status(404).json({message: 'there was error.'});
  }
});

/**
 *  Put user given the id and userBody as a parameter.
*/
// implement the PUT /user/id endpoint
router.put('/user/:id', async (req, res) => {
  console.log('UPDATE a user given the id and userBody as parameters.');
  // parse the body of the request
  if (!req.body.newUser) {
    res.status(404).json({ message: 'missing newUser' });
    return;
  }
  try {
    const result = await dbLib.updateObjectById(db, 'user', req.params.id, req.body.newUser);
    // send the response with the appropriate status code
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was error' });
  }
});

/**
 * 
 *  Following methods.
 * 
*/

// Implement the GET /following endpoint.
router.get('/following', async(req, res)=>{
  console.log('Get following map.');
  try {
    // get the data from the db
    let results;
    if(req.query.followerId && req.query.followingId) {
      const filterObj = {
        followerId: req.query.followerId,
        followingId: req.query.followingId
      }
      results = await dbLib.getObjectsByFilter(db, 'following', filterObj);
    } else if(req.query.followerId){
      const filterObj = {
        followerId: req.query.followerId
      }
      results = await dbLib.getObjectsByFilter(db, 'following', filterObj);
    }else if(req.query.followingId){
      const filterObj = {
        followingId: req.query.followingId
      }
      results = await dbLib.getObjectsByFilter(db, 'following', filterObj);
    }else{
      results = await dbLib.getAll(db, 'following');
    }
    // send the response with the appropriate status code
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was error.' });
  }  
});

// Implement the DELETE /following endpoint
router.delete('/following/:id', async(req, res)=>{
  console.log('Delete following map given followingMapId.');
  
  try {
    // get the data from the db
    const results = await dbLib.deleteObjectById(db, 'following', req.params.id);
    // send the response with the appropriate status code
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was error.' });
  }    
});

// Implement the POST /following endpoint
router.post('/following', async(req, res)=>{
  console.log('Create following item in map given followMapItem.');
  try {
    // get the data from the db
    const results = await dbLib.addObject(db, 'following', req.body.followMapItem);
    // send the response with the appropriate status code
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was error.' });
  }    
});

/**
 * 
 * Follower methods.
 * 
*/
// Implement the GET /follower endpoint
router.get('/follower', async (req, res) =>{
  console.log('Get followers given the followingId as query parameter');
  try {
    // get the data from the db
    const results = await dbLib.getObjectById(db, 'follower', req.query.followingId);
    // send the response with the appropriate status code
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was error.' });
  }
});



module.exports = router;
