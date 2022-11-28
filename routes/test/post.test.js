const request = require('supertest');
const webapp = require('../../app');
const dbLib = require('../../db/dbFunction');
const {ObjectId} = require("mongodb");

const endpoint = '/api/post/';
let mongo;

describe('Test the post endpoints', () => {
    let res;
    let db;
    let post;
    let postId;

    const expectedPost = {
        username: "demo",
        postType: 1,
        postContent: "https://images.unsplash.com/photo-1663818796346-6bc15be05b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY2NTc3ODY3NA&ixlib=rb-1.2.1&q=80&w=1080",
        description: "Molestias nobis animi commodi harum accusantium quaerat iusto itaque repellat.",
        public: true,
        tagging: [],
    }

    beforeAll(async () => {
        mongo = await dbLib.connect('test');
        db = await dbLib.getDb();
    });

    afterAll(async () => {
        try {
            await dbLib.close();  // close the connection to the database
        } catch (err) {
            return err;
        }
    });

    beforeEach(async () => {
        const user = {
            username: "demo",
            password: "password",
            email: "email@gmail.com",
            firstName: "first",
            lastName: "last",
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        }

        // Create a user.
        const userResp = await db.collection('user').insertOne(user);
        // console.log("user:" + JSON.stringify(userResp));

        res = (await request(webapp)
            .post(endpoint)
            .send(expectedPost)
            .set('Accept', 'application/json'));

        if(res._body.success){
            post = res._body.data;
            postId = post._id.toString();
            console.log("post: ", post);
        }else{
             console.log("Error in creating post");
        }
    });

    afterEach(async () => {
        const deleteRes = await db.collection('post').deleteMany({});
        const deleteRes2 = await db.collection('user').deleteMany({});
        if(deleteRes.ok !== 1){
            console.log("Error in deleting post");
        }
    });

    // Test the GET /post/:id endpoint
    test('GET /post/:id', async () => {

        res = (await request(webapp)
            .get(endpoint + post._id.toString())
            .set('Accept', 'application/json'));

        // Type and status checking
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');

        // Response body checking
        expect(res._body.success).toBe(true);
        expect(res._body.data).toMatchObject(expectedPost);

        // Test wrong id
        const tmpRes = (await request(webapp)
                    .get(endpoint + "123")
                    .set('Accept', 'application/json'));
        expect(tmpRes.status).toBe(500);

    });

    // Test GET /post/username/:username
    test('GET /post/username/:username', async () => {
        const res = (await request(webapp)
            .get(endpoint + 'username/' + post.username)
            .set('Accept', 'application/json'));

        // Type and status checking
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');

        // Response body checking
        expect(res._body.success).toBe(true);
        expect(res._body.data[0]).toMatchObject(expectedPost);

        // Test missing username
        const tmpRes = (await request(webapp)
                    .get(endpoint + 'username/' + "")
                    .set('Accept', 'application/json'));
        expect(tmpRes.status).toBe(500);
    });

    // Test GET /post/page/:page endpoint
    test('GET /post/page/:page', async () => {
        const user2 = {
            username: "demo2",
            password: "password",
            email: "email@gmail.com",
            firstName: "first",
            lastName: "last",
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        }
        const userResp = await db.collection('user').insertOne(user2);

        const secondObj = {
            username: "demo2",
            postType: 1,
            postContent: "https://images.unsplash.com/photo-1663818796346-6bc15be05b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY2NTc3ODY3NA&ixlib=rb-1.2.1&q=80&w=1080",
            description: "Molestias nobis animi commodi harum accusantium quaerat iusto itaque repellat.",
            public: true,
            tagging: [],
        }
        const putRes = (await request(webapp)
            .post(endpoint)
            .send(secondObj)
            .set('Accept', 'application/json'));

        console.log("putRes: ", putRes._body.data);

        const getRes = (await request(webapp)
            .get(endpoint + 'page/1')
            .set('Accept', 'application/json'));

        // Type and status checking
        expect(getRes.status).toBe(200);
        expect(getRes.type).toBe('application/json');


        // Response body checking
        expect(getRes._body.success).toBe(true);
        expect(getRes._body.data[1]).toMatchObject(expectedPost);
        expect(getRes._body.data[0]).toMatchObject(secondObj);

        // Test missing page
        const tmpRes = (await request(webapp)
                    .get(endpoint + 'page/' + "")
                    .set('Accept', 'application/json'));
        expect(tmpRes.status).toBe(500);


    });

    // Test POST /post endpoint
    test('POST /post', async () => {

        // Type and status checking
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');

        // Response body checking
        expect(res._body.success).toBe(true);
        expect(res._body.data).toMatchObject(expectedPost);

        // Check if the post is in the database
        const dbRes = await db.collection('post').findOne({_id: ObjectId(postId)});
        expect(dbRes).toMatchObject(expectedPost);

        const tmpRes = (await request(webapp)
            .post(endpoint)
            .send({})
            .set('Accept', 'application/json'));
        // Missing post Body
        expect(tmpRes.status).toBe(500);
        expect(tmpRes._body.success).toBe(false);
    });

    //Test PUT /post/:id endpoint
    test('PUT /post/:id', async () => {
        const updateObj = {
            description: "Changed description.",
        };
        const putRes = (await request(webapp)
            .put(endpoint + post._id.toString())
            .send(updateObj)
            .set('Accept', 'application/json'));

        // Type and status checking
        expect(putRes.status).toBe(200);
        expect(putRes.type).toBe('application/json');

        // Response body checking
        expect(putRes._body.success).toBe(true);

        expect(putRes._body.data).toMatchObject({
            username: "demo",
            postType: 1,
            postContent: "https://images.unsplash.com/photo-1663818796346-6bc15be05b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY2NTc3ODY3NA&ixlib=rb-1.2.1&q=80&w=1080",
            description: "Changed description.",
            public: true,
            tagging: [],
        });

        // Check if the post is changed in database
        const dbRes = await db.collection('post').findOne({_id: ObjectId(postId)});
        expect(dbRes).toMatchObject({
            username: "demo",
            postType: 1,
            postContent: "https://images.unsplash.com/photo-1663818796346-6bc15be05b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY2NTc3ODY3NA&ixlib=rb-1.2.1&q=80&w=1080",
            description: "Changed description.",
            public: true,
            tagging: [],
        });



        // Test wrong id
        const tmpRes = (await request(webapp)
                    .put(endpoint + "123")
                    .send(updateObj)
                    .set('Accept', 'application/json'));
        expect(tmpRes.status).toBe(500);

        // Test missing body
        const tmpRes2 = (await request(webapp)
                    .put(endpoint + post._id.toString())
                    .send({})
                    .set('Accept', 'application/json'));
        expect(tmpRes2.status).toBe(500);
    });

    // Test DELETE /post/:id endpoint
    test('DELETE /post/:id', async () => {

        const deleteRes = (await request(webapp)
            .delete(endpoint + post._id.toString())
            .set('Accept', 'application/json'));


        // Type and status checking
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.type).toBe('application/json');

        // Response body checking
        expect(deleteRes._body.success).toBe(true);
        console.log("deleteRes._body.data", deleteRes._body.data);

        // Test wrong id
        const tmpRes = (await request(webapp)
                    .delete(endpoint + "123")
                    .set('Accept', 'application/json'));
        expect(tmpRes.status).toBe(500);

        // Check if the post is in the database
        const dbRes = await db.collection('post').findOne({_id: ObjectId(postId)});
        expect(dbRes).toBe(null);

    });


});

