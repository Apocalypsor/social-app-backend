const request = require('supertest');
const dbLib = require('../../db/dbFunction');
const webapp = require('../../app');

const endpoint = "/api/comment/";
let mongo;

// TEST comment endpoints
describe("Test the comment endpoints", () => {
    let res;
    let db;
    let postId;
    let commentId;
    let commentResp;
    let userId;

    let token;
    let token2;


    const post = {
        username: "demo",
        postType: 1,
        postContent: "https://images.unsplash.com/photo-1663818796346-6bc15be05b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY2NTc3ODY3NA&ixlib=rb-1.2.1&q=80&w=1080",
        description: "Molestias nobis animi commodi harum accusantium quaerat iusto itaque repellat.",
        public: true,
        tagging: [],
    }

    const comment = "Here is a comment";

    const user = {
        username: 'demo',
        password: 'testPassword',
        email: 'testEmail@gmail.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        profilePicture: "https://ui-avatars.com/api/?rounded=true"
    }

    const commentUser = {
        username: 'commentUser',
        password: 'testPassword',
        email: 'testEmail@gmail.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        profilePicture: "https://ui-avatars.com/api/?rounded=true"
    }

    beforeAll(async () => {
        try {
            mongo = await dbLib.connect('test');
            db = await dbLib.getDb();
        } catch (err) {

        }
    }, 10000);

    afterAll(async () => {
        try {
            await dbLib.close();  // close the connection to the database
        } catch (err) {

        }
    }, 10000);

    beforeEach(async () => {
        try {
            await db.admin().ping();
        } catch (err) {
            await dbLib.connect('test');
            db = await dbLib.getDb();
        }

        // Create a user.
        const userResp = await db.collection('user').insertOne(user);
        await db.collection('user').insertOne(commentUser);

        const loginInfo = {
            username: "demo", password: 'testPassword'
        };
        const loginInfo2 = {
            username: "commentUser", password: 'testPassword'
        };

        const resp = await request(webapp)
            .post("/api/auth/" + 'login')
            .send(loginInfo)
            .set('Accept', 'application/json');

        token = resp.body.data.token;

        const resp2 = await request(webapp)
            .post("/api/auth/" + 'login')
            .send(loginInfo2)
            .set('Accept', 'application/json');

        token2 = resp2.body.data.token;


        // Create a post.
        res = (await request(webapp)
            .post("/api/post/")
            .send(post)
            .set('Accept', 'application/json')
            .set('token', token));


        postId = res._body.data._id.toString();


        userId = userResp.insertedId.toString();

        // Post a comment
        commentResp = (await request(webapp)
            .post(endpoint)
            .send({postId: postId, comment: comment, username: commentUser.username})
            .set('Accept', 'application/json')
            .set('token', token2));
        commentId = commentResp._body.data._id.toString();

    }, 10000);

    afterEach(async () => {
        // Delete the post
        await db.collection('post').deleteMany({});
        // Delete the user
        await db.collection('user').deleteMany({});
        // Delete the comment
        await db.collection('comment').deleteMany({});
    }, 10000);


    // Test the POST /api/comment endpoint
    test("Test POST /api/comment", async () => {
        // Type and status check
        expect(commentResp.status).toBe(200);
        expect(commentResp.type).toBe("application/json");

        // Response Body check
        expect(commentResp._body.success).toBe(true);
        expect(commentResp._body.data.postId).toBe(postId);
        expect(commentResp._body.data.comment).toBe(comment);


        // Test if wrong postId or username
        const wrongPostId = (await request(webapp)
            .post(endpoint)
            .send({postId: postId, comment: comment, username: "wrongUsername"})
            .set('Accept', 'application/json')
            .set('token', token));

        // Type and status check
        expect(wrongPostId.status).toBe(403);

        // Test missing postId or username
        const missingUsername = (await request(webapp)
            .post(endpoint)
            .send({comment: comment})
            .set('Accept', 'application/json')
            .set('token', token));

        // Type and status check
        expect(missingUsername.status).toBe(500);


    }, 10000);

    test("Test POST /api/comment/post", async () => {


        // Type and status check

        // Test if wrong postId or username
        const res = (await request(webapp)
            .get(endpoint + `${postId}/`)
            .set('Accept', 'application/json')
            .set('token', token));

        // Type and status check
        expect(res.status).toBe(200);

        const res2 = (await request(webapp)
            .get(endpoint + `postId/`)
            .set('Accept', 'application/json')
            .set('token', token));

        // Type and status check
        expect(res2.status).toBe(404);

        // Test missing postId or username


    }, 50000);


    test("Test DELETE /api/comment/", async () => {


        // Type and status check

        // Test if wrong postId or username
        const res = (await request(webapp)
            .delete(endpoint + `${commentId}/`)
            .set('Accept', 'application/json')
            .set('token', token2));

        // Type and status check
        expect(res.status).toBe(200);

        const res2 = (await request(webapp)
            .delete(endpoint + `commentId/`)
            .set('Accept', 'application/json')
            .set('token', token2));

        // Type and status check
        expect(res2.status).toBe(500);

    }, 10000);


});