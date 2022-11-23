const {MongoClient, ObjectId} = require('mongodb');

require('dotenv').config()

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

const close = (con) => {
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
    if (filter._id) {
        filter._id = ObjectId(filter._id);
    }
    return filter;
}

const getObjectById = async (db, collectionName, id) => {
    try {
        return await db.collection(collectionName).findOne({_id: ObjectId(id)});
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const getObjects = async (db, collectionName) => {
    try {
        return await db.collection(collectionName).find().toArray();
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const getObjectByFilter = async (db, collectionName, filter) => {
    try {
        return await db.collection(collectionName).findOne(handleFilter(filter));
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const getObjectsByFilter = async (db, collectionName, filter) => {
    try {
        return await db.collection(collectionName).find(handleFilter(filter)).toArray();
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const addObject = async (db, collectionName, object) => {
    try {
        let now = new Date();
        object.createdAt = now;
        object.updatedAt = now;
        let res = await db.collection(collectionName).insertOne(object);
        object._id = res.insertedId;
        return object;
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const updateObjectById = async (db, collectionName, id, object) => {
    try {
        object.updatedAt = new Date();
        object._id = ObjectId(id);
        let res = await db.collection(collectionName).updateOne({_id: ObjectId(id)}, {$set: object});
        if (res.matchedCount === 1) {
            object._id = ObjectId(id);
            return object;
        }
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const replaceObjectById = async (db, collectionName, id, object) => {
    try {
        object._id = ObjectId(id);
        object.updatedAt = new Date();
        let res = await db.collection(collectionName).replaceOne({_id: ObjectId(id)}, object);
        if (res.matchedCount === 1) {
            return object;
        }
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const deleteObjectById = async (db, collectionName, id) => {
    try {
        const res = await db.collection(collectionName).findOneAndDelete({_id: ObjectId(id)});
        if (res.ok === 1) {
            return res.value;
        }
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

// export the functions
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
    deleteObjectById
};