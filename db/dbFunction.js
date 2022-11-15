const {MongoClient} = require('mongodb');
const {generateId} = require("../util/snowflake");

require('dotenv').config()

// the mongodb server URL
const dbURL = process.env.DB_URL;

// connection to the db
const connect = async () => {
  // always use try/catch to handle any exception
  try {
    const con = (await MongoClient.connect(
      dbURL,
        {useNewUrlParser: true, useUnifiedTopology: true},
    )).db();
      // check that we are connected to the db
      console.log(`connected to db: ${con.databaseName}`);
      return con;
  } catch (err) {
      console.log(err.message);
  }
};

const getObjectById = async (db, collectionName, id) => {
    try {
        return await db.collection(collectionName).findOne({id: id});
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const getObjectByFilter = async (db, collectionName, filter) => {
    try {
        return await db.collection(collectionName).findOne(filter);
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const getObjectsByFilter = async (db, collectionName, filter) => {
    try {
        return await db.collection(collectionName).find(filter).toArray();
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const addObject = async (db, collectionName, object) => {
    try {
        object.id = generateId();
        return await db.collection(collectionName).insertOne(object);
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const updateObjectById = async (db, collectionName, id, object) => {
    try {
        return await db.collection(collectionName).updateOne({id: id}, {$set: object});
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const replaceObjectById = async (db, collectionName, id, object) => {
    try {
        object.id = generateId();
        return await db.collection(collectionName).replaceOne({id: id}, object);
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

const deleteObjectById = async (db, collectionName, id) => {
    try {
        return await db.collection(collectionName).deleteOne({id: id});
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}

// export the functions
module.exports = {
    connect,
    getObjectById,
    getObjectByFilter,
    getObjectsByFilter,
    addObject,
    updateObjectById,
    replaceObjectById,
    deleteObjectById
};