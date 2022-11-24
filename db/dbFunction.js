const {MongoClient, ObjectId} = require('mongodb');
const {UserNotFoundError} = require("../errors/userError");

require('dotenv').config();

// the mongodb server URL
const dbURL = process.env.DB_URL;

let con;
let db;

// connection to the db
const connect = async (database) => {
    // always use try/catch to handle any exception
    database = database || 'toktik';
    try {
        con = (await MongoClient.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true}));
        db = con.db(database);
        // check that we are connected to the db
        console.log(`connecting to db: ${db.databaseName}`);
    } catch (err) {
        console.log(err.message);
    }
}

const close = () => {
    try {
        con.close();
        console.log('close connection');
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const getDb = async () => {
    return db;
}


const handleFilter = (filter) => {
    const needToHandle = ['_id'];
    for (let key in filter) {
        if (needToHandle.includes(key) && !(filter[key] instanceof ObjectId)) {
            filter[key] = ObjectId(filter[key]);
        }
    }
    return filter;
}

const getObjectById = async (db, collectionName, id) => {
    return await db.collection(collectionName).findOne({_id: ObjectId(id)});
}

const getObjects = async (db, collectionName) => {
    return await db.collection(collectionName).find().toArray();
}

const getObjectByFilter = async (db, collectionName, filter) => {
    return await db.collection(collectionName).findOne(handleFilter(filter));
}

const getObjectsByFilter = async (db, collectionName, filter) => {
    return await db.collection(collectionName).find(handleFilter(filter)).toArray();
}

const addObject = async (db, collectionName, object) => {
    if (object._id) {
        delete object._id;
    }

    let now = new Date();
    object.createdAt = now;
    object.updatedAt = now;
    let res = await db.collection(collectionName).insertOne(handleFilter(object));
    object._id = res.insertedId;
    return object;
}

const updateObjectById = async (db, collectionName, id, object) => {
    object.updatedAt = new Date();
    object._id = ObjectId(id);
    let res = await db.collection(collectionName).updateOne({_id: ObjectId(id)}, {$set: object});
    if (res.matchedCount === 1) {
        object._id = ObjectId(id);
        return object;
    } else {
        throw new UserNotFoundError("User not found");
    }
}

const replaceObjectById = async (db, collectionName, id, object) => {
    object._id = ObjectId(id);
    object.updatedAt = new Date();
    let res = await db.collection(collectionName).replaceOne({_id: ObjectId(id)}, object);
    if (res.matchedCount === 1) {
        return object;
    }
}

const deleteObjectById = async (db, collectionName, id) => {
    const res = await db.collection(collectionName).findOneAndDelete({_id: ObjectId(id)});
    console.log(res);
    if (res.ok === 1) {
        if (res.lastErrorObject.n === 1) {
            return res.value;
        } else {
            throw new UserNotFoundError();
        }
    } else {
        throw new Error('delete failed');
    }
}

const getFollowerNamesByUsername = async (db, username) => {
    const res = await db.collection('user').aggregate([
        {$match: {username: username}},
        {$lookup: {from: 'follow', localField: '_id', foreignField: 'followingId', as: 'follow'}},
        {$unwind: '$follow'},
        {$lookup: {from: 'user', localField: 'follow.followerId', foreignField: '_id', as: 'follower'}},
        {$unwind: '$follower'},
        {$project: {_id: 0, follower: '$follower.username'}}
    ]).toArray();

    return res.map(item => item.follower);
}

const getFollowCountByUsername = async (db, username) => {
    const res = await db.collection('user').aggregate([
        {$match: {username: username}},
        {$lookup: {from: 'follow', localField: '_id', foreignField: 'followingId', as: 'follow'}},
        {$unwind: '$follow'},
        {$project: {_id: 0, follower: '$follow.followerId'}}
    ]).toArray();

    return res.length;
}



const getFollowStatusByUsername = async (db, followerUsername, followingUsername) => {
    const res = await db.collection('user').aggregate([
        {$match: {username: followingUsername}},
        {$lookup: {from: 'follow', localField: '_id', foreignField: 'followingId', as: 'follow'}},
        {$unwind: '$follow'},
        {$lookup: {from: 'user', localField: 'follow.followerId', foreignField: '_id', as: 'follower'}},
        {$unwind: '$follower'},
        {$match: {'follower.username': followerUsername}},
        {$project: {_id: 0, follow: '$follow'}}
    ]).toArray();

    return res.length > 0;
}

const postFollowByUsername = async (db, followerUsername, followingUsername) => {
    const follower = await db.collection('user').findOne({username: followerUsername});
    const following = await db.collection('user').findOne({username: followingUsername});
    console.log(follower);
    console.log(following);

    if (follower && following) {
        const res = await db.collection('follow').insertOne({
            followerId: follower._id,
            followingId: following._id,
        });
        return res.insertedId;
    } else {
        throw new UserNotFoundError();
    }
}

const postUnfollowByUsername = async (db, followerUsername, followingUsername) => {
    const follower = await db.collection('user').findOne({username: followerUsername});
    const following = await db.collection('user').findOne({username: followingUsername});

    if (follower && following) {
        const res = await db.collection('follow').findOneAndDelete({
            followerId: follower._id,
            followingId: following._id
        });
        if (res.ok === 1) {
            if (res.lastErrorObject.n === 1) {
                return res.value;
            } else {
                throw new UserNotFoundError();
            }
        } else {
            throw new Error('delete failed');
        }
    } else {
        throw new UserNotFoundError();
    }
}


module.exports = {
    connect,
    close,
    getDb,
    getObjects,
    getObjectById,
    getObjectByFilter,
    getObjectsByFilter,
    addObject,
    updateObjectById,
    replaceObjectById,
    deleteObjectById,
    getFollowCountByUsername,
    getFollowerNamesByUsername,
    getFollowStatusByUsername,
    postFollowByUsername,
    postUnfollowByUsername
};