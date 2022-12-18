const {MongoClient} = require('mongodb');
const faker = require('@faker-js/faker').faker;
const {addObjects} = require('../db/dbFunction');

const images = require('./links').images;
const comments = require('./links').comments;

require('dotenv').config();

let allUsernames = [];
let allUsers = [];
let allPosts = [];
let followMap = [];
let likeMap = [];
let db;

let imgIndex = 0;

const getRandomFormArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const getAllComments = async (posts) => {
    const commentsInPost = [];
    for (let i = 0; i < posts.length * (Math.floor(Math.random() * 5) + 5); i++) {
        const luckyPost = getRandomFormArray(posts);
        const comment = {
            username: getRandomFormArray(allUsernames),
            postId: luckyPost._id,
            message: getRandomFormArray(comments),
            mention: null
        };

        commentsInPost.push(comment);
    }

    return await addObjects(db, "comment", commentsInPost);
}

const getAllPosts = async (users) => {
    const posts = [];
    for (let i = 0; i < users.length * (Math.floor(Math.random() * 10) + 5); i++) {
        const luckyUser = getRandomFormArray(users);
        posts.push({
            username: luckyUser.username,
            postType: 0,
            postContent: images[imgIndex++],
            description: faker.lorem.sentence(),
            public: true,
            tagging: [],
        });
    }

    return await addObjects(db, "post", posts);
}

const getUser = async (n) => {
    let user = {
        username: "demo",
        firstName: "Joe",
        lastName: "Biden",
        email: "abc@gmail.com",
        password: "123456",
        profilePicture: "https://ui-avatars.com/api/?rounded=true",
    }

    const users = [user];
    allUsernames.push(user.username);

    for (let i = 0; i < n - 1; i++) {
        let tmpUsername = faker.internet.userName();
        allUsernames.push(tmpUsername);
        user = {
            username: tmpUsername,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            profilePicture: "https://ui-avatars.com/api/?rounded=true",
        }

        users.push(user);
    }

    return await addObjects(db, "user", users);

}

const generateLikeRelationship = async () => {
    for (let user of allUsernames) {
        for (let post of allPosts) {
            if (Math.random() > 0.5) {
                likeMap.push({userLike: user, postId: post._id});
            }
        }
    }

    return await addObjects(db, 'like', likeMap);
}

const generateFollowingRelationship = async () => {
    for (let user1 of allUsernames) {
        for (let user2 of allUsernames) {
            if (user1 === user2) continue;
            if (Math.random() > 0.5) {
                followMap.push({follower: user1, following: user2});
            }
        }
    }

    return await addObjects(db, 'follow', followMap);
}

async function main() {
    const con = (await MongoClient.connect(
        process.env.DB_URL,
        {useNewUrlParser: true, useUnifiedTopology: true},
    ));

    db = con.db(process.env.DB_NAME);
    let allCollections = await db.listCollections().toArray();

    for (let collection of allCollections) {
        await db.dropCollection(collection.name);
    }

    allUsers = await getUser(30);
    allPosts = await getAllPosts(allUsers);
    await getAllComments(allPosts);

    await generateFollowingRelationship();
    await generateLikeRelationship();

    await db.collection('user').createIndex({username: 1}, {unique: true});

    await con.close();

    console.log(imgIndex);
}

main().then(() => console.log("done"));

