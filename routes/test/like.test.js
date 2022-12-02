const request = require('supertest');
const webapp = require('../../app');
const dbLib = require('../../db/dbFunction');
const {ObjectId} = require("mongodb");

const endpoint = '/api/like/';
let mongo;

describe('Test the like endpoints', () => {
    let db;
    let postId;
    let username;

    beforeAll(async () => {
        try {
            mongo = await dbLib.connect('test');
            db = await dbLib.getDb();
        } catch (err) {

        }
    });

    afterAll(async () => {
        try {
            await dbLib.close();  // close the connection to the database
        } catch (err) {

        }
    });

    beforeEach(async () => {
        try {
            await db.admin().ping();
        } catch (err) {
            await dbLib.connect('test');
            db = await dbLib.getDb();
        }


        // Create a post.
        const post1 = {
            username: "testUser1",
            postType: 1,
            postContent: "https://images.unsplash.com/photo-1663818796346-6bc15be05b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY2NTc3ODY3NA&ixlib=rb-1.2.1&q=80&w=1080",
            description: "Molestias nobis animi commodi harum accusantium quaerat iusto itaque repellat.",
            public: true,
            tagging: [],
        }

        // Create a user.
        const user1 = {
            username: 'testUser1',
            password: 'testPassword1',
            email: 'testEmail1@gmail.com',
            firstName: 'testFirstName1',
            lastName: 'testLastName1',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        }


        // Post in dataset
        const postResp = await db.collection('post').insertOne(post1);
        await db.collection('user').insertOne(user1);

        //
        username = user1.username;
        postId = postResp.insertedId.toString();

    });

    afterEach(async () => {
        try {
            await db.collection('post').deleteMany({});
            await db.collection('user').deleteMany({});
            await db.collection('like').deleteMany({});
        } catch (err) {

        }
    });

    // Test /like endpoint
    test('Test /like endpoint', async () => {

        const likeResp = await request(webapp)
            .post(endpoint + "like")
            .send({
                userLike: username,
                postId: postId
            })
            .set('Accept', 'application/json');


        // Type and status checking
        expect(likeResp.status).toBe(200);
        expect(likeResp.type).toBe('application/json');

        // Check the response body
        expect(likeResp._body.success).toBe(true);
        expect(likeResp._body.data).toBe(true);

        // Check the database
        const like = await db.collection('like').findOne({userLike: username, postId: ObjectId(postId)});

        expect(like).toMatchObject({userLike: username, postId: ObjectId(postId)});


        // Test missing postId or userLike
        const likeResp2 = await request(webapp)
            .post(endpoint + "like")
            .send({postId: postId})
            .set('Accept', 'application/json');
        // Check the status
        expect(likeResp2.status).toBe(500);
        // Check the response body
        expect(likeResp2._body.success).toBe(false);

        // Test wrong postId or userLike
        const likeResp3 = await request(webapp)
            .post(endpoint + "like")
            .send({userLike: username, postId: "123"})
            .set('Accept', 'application/json');
        // Check the status
        expect(likeResp3.status).toBe(500);
        // Check the response body
        expect(likeResp3._body.success).toBe(false);
    });

    // Test /unlike endpoint
    test('Test /unlike endpoint', async () => {

        // Create a like
        const likeResp = await db.collection('like').insertOne({userLike: username, postId: ObjectId(postId)});
        likeResp.insertedId.toString();

        const unlikeResp = await request(webapp)
            .post(endpoint + "unlike")
            .send({
                userLike: username,
                postId: postId
            })
            .set('Accept', 'application/json');

        // Type and status checking
        expect(unlikeResp.status).toBe(200);
        expect(unlikeResp.type).toBe('application/json');

        // Check the response body
        expect(unlikeResp._body.success).toBe(true);
        expect(unlikeResp._body.data).toBe(true);

        // Check the database
        const like = await db.collection('like').findOne({
            userLike: username,
            postId: ObjectId(postId)
        });
        expect(like).toBe(null);

        // Test missing postId or userLike
        const unlikeResp2 = await request(webapp)
            .post(endpoint + "unlike")
            .send({postId: postId})
            .set('Accept', 'application/json');
        // Check the status
        expect(unlikeResp2.status).toBe(500);

        // Test wrong postId or userLike
        const unlikeResp3 = await request(webapp)
            .post(endpoint + "unlike")
            .send({userLike: username, postId: "123"})
            .set('Accept', 'application/json');
        // Check the status
        expect(unlikeResp3.status).toBe(500);

    });

    // Test /is-like/:likeUsername/:postId endpoint
    test('Test /is-like/:likeUsername/:postId endpoint', async () => {

        // Create a like
        const likeResp = await db.collection('like').insertOne({
            userLike: username,
            postId: ObjectId(postId)
        });
        likeResp.insertedId.toString();

        const isLikeResp = await request(webapp)
            .get(endpoint + "is-like/" + username + "/" + postId)
            .set('Accept', 'application/json');

        // Type and status checking
        expect(isLikeResp.status).toBe(200);
        expect(isLikeResp.type).toBe('application/json');

        // Check the response body
        expect(isLikeResp._body.success).toBe(true);
        expect(isLikeResp._body.data).toBe(true);

        // unlike the post
        await db.collection('like').deleteOne({
            userLike: username,
            postId: ObjectId(postId)
        });

        const isLikeResp2 = await request(webapp)
            .get(endpoint + "is-like/" + username + "/" + postId)
            .set('Accept', 'application/json');
        // Type and status checking
        expect(isLikeResp2.status).toBe(200);
        expect(isLikeResp2.type).toBe('application/json');
        // Check the response body
        expect(isLikeResp2._body.success).toBe(true);
        expect(isLikeResp2._body.data).toBe(false);

        // Test wrong postId or userLike
        const isLikeResp3 = await request(webapp)
            .get(endpoint + "is-like/" + username + "/123")
            .set('Accept', 'application/json');
        // Check the status
        expect(isLikeResp3.status).toBe(500);

        // Test missing postId or userLike
        const isLikeResp4 = await request(webapp)
            .get(endpoint + "is-like/" + username)
            .set('Accept', 'application/json');
        // Check the status
        expect(isLikeResp4.status).toBe(404);
    });

    // Test /count-like/:postId endpoint
    test('Test /count/:postId endpoint', async () => {

        // Create a like
        const likeResp = await db.collection('like').insertOne({
            userLike: username,
            postId: ObjectId(postId)
        });
        likeResp.insertedId.toString();

        const countLikeResp = await request(webapp)
            .get(endpoint + "count/" + postId)
            .set('Accept', 'application/json');

        // Type and status checking
        expect(countLikeResp.status).toBe(200);
        expect(countLikeResp.type).toBe('application/json');
        // Check the response body
        expect(countLikeResp._body.success).toBe(true);
        expect(countLikeResp._body.data).toBe(1);


    });


});