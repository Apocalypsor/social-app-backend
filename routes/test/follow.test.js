const request = require('supertest');
const webapp = require('../../app');
const dbLib = require('../../db/dbFunction');

const endpoint = '/api/follow/';
let mongo;

let token;
let token2;

let token3;
let token4;
let token5;
let token6;


// Test the follow endpoints
describe('Test the follow endpoints', () => {
    let db;

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

        // post two users
        const user1 = {
            username: "testUser1",
            password: 'testPassword1',
            email: 'testEmail1@gmail.com',
            firstName: 'testFirstName1',
            lastName: 'testLastName1',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        }
        const user2 = {
            username: "testUser2",
            password: 'testPassword2',
            email: 'testEmail2@gmail.com',
            firstName: 'testFirstName2',
            lastName: 'testLastName2',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        }


        const resp = await request(webapp)
            .post('/api/auth/register')
            .send(user1)
            .set('Accept', 'application/json');

        token = resp.body.data.token;

        const resp2 = await request(webapp)
            .post('/api/auth/register')
            .send(user2)
            .set('Accept', 'application/json');

        token2 = resp2.body.data.token;
    });

    afterEach(async () => {
        // delete the two users
        await db.collection('user').deleteMany({});
        await db.collection('follow').deleteMany({});
    });

    test('Test /follow endpoint', async () => {
        console.log(token);
        console.log(token2);
    });

    // Test follow endpoint
    test('POST /follow/follow', async () => {

        // follow user2 by user1
        const res = (await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token));

        expect(res.statusCode).toEqual(200);
        expect(res._body.success).toEqual(true);
        expect(res._body.data).toEqual(true);

        // Check the database
        const followRes = await db.collection('follow').findOne({following: "testUser2", follower: "testUser1"});
        expect(followRes).not.toBeNull();
        expect(followRes).toMatchObject({following: "testUser2", follower: "testUser1"});

        // Test wrong username
        const tmpRes = (await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser3"})
            .set('Accept', 'application/json')
            .set('token', token));
        expect(tmpRes.statusCode).toEqual(403);

        // Test missing username
        const tmpRes2 = (await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2"})
            .set('Accept', 'application/json')
            .set('token', token));
        expect(tmpRes2.statusCode).toEqual(404);

        // Delete the follow
        await db.collection('follow').findOneAndDelete({following: "testUser2", follower: "testUser1"});

    });

    // Test unfollow endpoint
    test('POST /follow/unfollow', async () => {

        // Follow user2 by user1
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);

        // Check the database
        const followRes = await db.collection('follow').findOne({following: "testUser2", follower: "testUser1"});
        expect(followRes).not.toBeNull();
        expect(followRes).toMatchObject({following: "testUser2", follower: "testUser1"});


        // Test the wrong username
        const tmpRes = (await request(webapp)
            .post(endpoint + 'unfollow')
            .send({following: "testUser2", follower: "testUser3"})
            .set('Accept', 'application/json')
            .set('token', token));
        expect(tmpRes.status).toEqual(403);

        // Test the missing username
        const tmpRes2 = (await request(webapp)
            .post(endpoint + 'unfollow')
            .send({following: "testUser2"})
            .set('Accept', 'application/json')
            .set('token', token));
        expect(tmpRes2.status).toEqual(404);

        // Unfollow user2 by user1
        const unfollowResp = (await request(webapp)
            .post(endpoint + 'unfollow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token));

        // Check the resp status
        expect(unfollowResp.status).toEqual(200);
        expect(unfollowResp._body.success).toEqual(true);

        // Check the database
        const unfollowRes = await db.collection('follow').findOne({following: "testUser2", follower: "testUser1"});
        expect(unfollowRes).toBeNull();

    });

    // Test /follow/follower-names/:username endpoint
    test('GET /follow/follower-names/:username', async () => {

        // Follow user2 by user1
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);

        // Check the database
        const followRes = await db.collection('follow').findOne({following: "testUser2", follower: "testUser1"});
        expect(followRes).not.toBeNull();
        expect(followRes).toMatchObject({following: "testUser2", follower: "testUser1"});

        // Test the wrong username


        // Test the missing username
        const tmpRes2 = (await request(webapp)
            .get(endpoint + 'follower-names/')
            .set('Accept', 'application/json')
            .set('token', token));
        expect(tmpRes2.status).toEqual(404);

        // Get the follower names
        const followerNamesResp = (await request(webapp)
            .get(endpoint + 'follower-names/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));

        // Check the resp status
        expect(followerNamesResp.status).toEqual(200);
        expect(followerNamesResp._body.success).toEqual(true);
        expect(followerNamesResp._body.data[0]).toEqual("testUser1");

        // Unfollow user2 by user1
        const unfollowResp = (await request(webapp)
            .post(endpoint + 'unfollow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token));

        // Check the resp status
        expect(unfollowResp.status).toEqual(200);
        expect(unfollowResp._body.success).toEqual(true);

        // Check the database
        const unfollowRes = await db.collection('follow').findOne({following: "testUser2", follower: "testUser1"});
        expect(unfollowRes).toBeNull();

    });

    // Test /follow/following-count/:username endpoint and /follow/follower-count/:username endpoint
    test('GET /follow/following-count/:username and GET /follow/follower-count/:username', async () => {
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);

        // Test following count
        const followingCountResp1 = (await request(webapp)
            .get(endpoint + 'following-count/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followingCountResp1.status).toEqual(200);
        expect(followingCountResp1.type).toEqual('application/json');

        // Response check
        expect(followingCountResp1._body.success).toEqual(true);
        expect(followingCountResp1._body.data).toEqual(1);

        const followingCountResp2 = (await request(webapp)
            .get(endpoint + 'following-count/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followingCountResp2.status).toEqual(200);
        expect(followingCountResp2.type).toEqual('application/json');

        // Response check
        expect(followingCountResp2._body.success).toEqual(true);
        expect(followingCountResp2._body.data).toEqual(0);

        // Test follower count
        const followerCountResp1 = (await request(webapp)
            .get(endpoint + 'follower-count/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followerCountResp1.status).toEqual(200);
        expect(followerCountResp1.type).toEqual('application/json');

        // Response check
        expect(followerCountResp1._body.success).toEqual(true);
        expect(followerCountResp1._body.data).toEqual(0);

        const followerCountResp2 = (await request(webapp)
            .get(endpoint + 'follower-count/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followerCountResp2.status).toEqual(200);
        expect(followerCountResp2.type).toEqual('application/json');

        // Response check
        expect(followerCountResp2._body.success).toEqual(true);
        expect(followerCountResp2._body.data).toEqual(1);

        // Unfollow user2 by user1
        await request(webapp)
            .post(endpoint + 'unfollow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);

        // Following count check
        const followingCountResp3 = (await request(webapp)
            .get(endpoint + 'following-count/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followingCountResp3.status).toEqual(200);
        expect(followingCountResp3.type).toEqual('application/json');

        // Response check
        expect(followingCountResp3._body.success).toEqual(true);
        expect(followingCountResp3._body.data).toEqual(0);

        const followingCountResp4 = (await request(webapp)
            .get(endpoint + 'following-count/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followingCountResp4.status).toEqual(200);
        expect(followingCountResp4.type).toEqual('application/json');

        // Response check
        expect(followingCountResp4._body.success).toEqual(true);
        expect(followingCountResp4._body.data).toEqual(0);

        // Follower Count check
        const followerCountResp3 = (await request(webapp)
            .get(endpoint + 'follower-count/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followerCountResp3.status).toEqual(200);
        expect(followerCountResp3.type).toEqual('application/json');

        // Response check
        expect(followerCountResp3._body.success).toEqual(true);
        expect(followerCountResp3._body.data).toEqual(0);

        const followerCountResp4 = (await request(webapp)
            .get(endpoint + 'follower-count/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));

        // Type check
        expect(followerCountResp4.status).toEqual(200);
        expect(followerCountResp4.type).toEqual('application/json');

        // Response check
        expect(followerCountResp4._body.success).toEqual(true);
        expect(followerCountResp4._body.data).toEqual(0);

        // Following count check
        // Test wrong username


        // Test missing username
        const followingCountResp6 = (await request(webapp)
            .get(endpoint + 'following-count/')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followingCountResp6.status).toEqual(404);

        // Follower count check
        // Test missing username
        const followerCountResp6 = (await request(webapp)
            .get(endpoint + 'follower-count/')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followerCountResp6.status).toEqual(404);

    });

    // Test /is-following/:followerUsername/:followingUsername endpoint
    test('Test /is-following/:followerUsername/:followingUsername endpoint', async () => {

        // user1 follows user2
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);

        // Test is following
        const isFollowingResp1 = (await request(webapp)
            .get(endpoint + 'is-following/testUser1/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(isFollowingResp1.status).toEqual(200);
        expect(isFollowingResp1.type).toEqual('application/json');

        // Response check
        expect(isFollowingResp1._body.success).toEqual(true);
        expect(isFollowingResp1._body.data).toEqual(true);

        const isFollowingResp2 = (await request(webapp)
            .get(endpoint + 'is-following/testUser2/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(isFollowingResp2.status).toEqual(200);
        expect(isFollowingResp2.type).toEqual('application/json');

        // Response check
        expect(isFollowingResp2._body.success).toEqual(true);
        expect(isFollowingResp2._body.data).toEqual(false);


        // Test missing username
        const isFollowingResp4 = (await request(webapp)
            .get(endpoint + 'is-following/testUser1/')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(isFollowingResp4.status).toEqual(404);


    });

    // Test /follow/suggestions/:username endpoint
    test('Test /follow/suggestions/:username endpoint', async () => {
        //Set up users and following map
        const user3 = {
            username: "testUser3",
            password: 'testPassword3',
            email: 'testEmail3@gmail.com',
            firstName: 'testFirstName3',
            lastName: 'testLastName3',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        };
        const user4 = {
            username: "testUser4",
            password: 'testPassword4',
            email: 'testEmail4@gmail.com',
            firstName: 'testFirstName4',
            lastName: 'testLastName4',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        };
        const user5 = {
            username: "testUser5",
            password: 'testPassword5',
            email: 'testEmail5@gmail.com',
            firstName: 'testFirstName5',
            lastName: 'testLastName5',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        };
        const user6 = {
            username: "testUser6",
            password: 'testPassword6',
            email: 'testEmail6@gmail.com',
            firstName: 'testFirstName6',
            lastName: 'testLastName6',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        };

        // Create users
        const resp3 = await request(webapp)
            .post('/api/auth/register')
            .send(user3)
            .set('Accept', 'application/json');

        token3 = resp3.body.data.token;

        const resp4 = await request(webapp)
            .post('/api/auth/register')
            .send(user4)
            .set('Accept', 'application/json');

        token4 = resp4.body.data.token;

        const resp5 = await request(webapp)
            .post('/api/auth/register')
            .send(user5)
            .set('Accept', 'application/json');

        token5 = resp5.body.data.token;

        const resp6 = await request(webapp)
            .post('/api/auth/register')
            .send(user6)
            .set('Accept', 'application/json');

        token6 = resp6.body.data.token;

        // user1 follows user2, user3, user4, user5
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser3", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser4", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser5", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);
        // user2 follows user3, user4, user5, user6
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser3", follower: "testUser2"})
            .set('Accept', 'application/json')
            .set('token', token2);
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser4", follower: "testUser2"})
            .set('Accept', 'application/json')
            .set('token', token2);
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser5", follower: "testUser2"})
            .set('Accept', 'application/json')
            .set('token', token2);
        await request(webapp)
            .post(endpoint + 'follow')
            .send({following: "testUser6", follower: "testUser2"})
            .set('Accept', 'application/json')
            .set('token', token2);

        // Check the suggestions
        const followSuggestionsResp1 = (await request(webapp)
            .get(endpoint + 'suggestions/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followSuggestionsResp1.status).toEqual(200);
        expect(followSuggestionsResp1.type).toEqual('application/json');


        // Response check
        expect(followSuggestionsResp1._body.success).toEqual(true);
        expect(followSuggestionsResp1._body.data.length).toEqual(0);

        // Check the suggestions for testUser1
        await request(webapp)
            .post(endpoint + 'unfollow')
            .send({following: "testUser2", follower: "testUser1"})
            .set('Accept', 'application/json')
            .set('token', token);
        const followSuggestionsResp2 = (await request(webapp)
            .get(endpoint + 'suggestions/testUser1')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followSuggestionsResp2.status).toEqual(200);
        expect(followSuggestionsResp2.type).toEqual('application/json');


        // Response check
        expect(followSuggestionsResp2._body.success).toEqual(true);
        expect(followSuggestionsResp2._body.data.length).toEqual(1);
        expect(followSuggestionsResp2._body.data[0]).toEqual("testUser2");


        // Check the suggestions for testUser2
        const followSuggestionsResp3 = (await request(webapp)
            .get(endpoint + 'suggestions/testUser2')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followSuggestionsResp3.status).toEqual(200);
        expect(followSuggestionsResp3.type).toEqual('application/json');

        // Response check
        expect(followSuggestionsResp3._body.success).toEqual(true);
        expect(followSuggestionsResp3._body.data.length).toEqual(1);
        expect(followSuggestionsResp3._body.data[0]).toEqual("testUser1");

        // Test the missing username
        const followSuggestionsResp5 = (await request(webapp)
            .get(endpoint + 'suggestions/')
            .set('Accept', 'application/json')
            .set('token', token));
        // Type check
        expect(followSuggestionsResp5.status).toEqual(404);

        // Delete users
        await db.collection('user').deleteMany({profilePicture: "https://ui-avatars.com/api/?rounded=true"});

        // Delete relationship
        await db.collection('follow').deleteMany({follower: "testUser1"});
        await db.collection('follow').deleteMany({follower: "testUser2"});
    }, 30000);


});