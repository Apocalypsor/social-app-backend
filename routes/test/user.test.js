const request = require('supertest');
const dbLib = require('../../db/dbFunction');
const webapp = require('../../app');
const {deleteObjectById} = require("../../db/dbFunction");
const {ObjectId} = require("mongodb");

const endpoint = "/api/user/";
let mongo;


// TEST USER ENDPOINTS
describe("Test user endpoints", () => {
    let res;
    let db;
    let actualUser;

    let token;

    const expectedUser = {
        username: 'testUser',
        password: 'testPassword',
        email: 'testEmail@gmail.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        profilePicture: "https://ui-avatars.com/api/?rounded=true"
    };
    const expectedResp = {
        success: true,
        data: expectedUser,
    }

    beforeAll(async () => {
        try {
            mongo = await dbLib.connect('test');
            db = await dbLib.getDb();

            res = (await request(webapp)
                .post("/api/auth/register")
                .send({
                    username: 'testUser',
                    password: 'testPassword',
                    email: 'testEmail@gmail.com',
                    firstName: 'testFirstName',
                    lastName: 'testLastName',
                    profilePicture: "https://ui-avatars.com/api/?rounded=true"
                })
                .set('Accept', 'application/json'));

            token = res.body.data.token;

            actualUser = await db.collection('user').findOne({username: res.body.data.username});


            if (res._body.success) {
                actualUser = res._body.data;

            } else {
                console.log("Create user failed");
            }
        } catch (err) {

        }
    }, 10000);

    afterAll(async () => {
        try {
            await clearDatabase();
            await dbLib.close();  // close the connection to the database
        } catch (err) {

        }
    }, 10000);

    const clearDatabase = async () => {
        try {
            if (actualUser._id instanceof ObjectId) {
                actualUser._id = actualUser._id.toString();
            }
            await deleteObjectById(db, 'user', actualUser._id);

        } catch (err) {

        }
    };


    /**
     *  Test GET /user endpoint
     * */

    // Test GET /user/:username endpoint
    test("GET /user/:username", async () => {
        const res = await request(webapp)
            .get(endpoint + `${actualUser.username}`)
            .set('Accept', 'application/json')
            .set('token', token);


        expect(res.header["content-type"]).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/json');
        expect(res._body).toMatchObject(expectedResp);

        // Test no username.
        const tmpRes = await request(webapp)
            .get(endpoint + '')
            .set('Accept', 'application/json')
            .set('token', token);
        expect(tmpRes.status).toEqual(404);
    }, 10000);


    // Test GET /user/search/:username endpoint
    test("GET /user/search/:username", async () => {
        const res = await request(webapp)
            .get(endpoint + `search/${actualUser.username}`)
            .set('Accept', 'application/json')
            .set('token', token);

        expect(res.header["content-type"]).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/json');
        expect(res._body.data[0]).toMatchObject(expectedUser);

        // No need to test Wrong Username.
        const tmpRes = await request(webapp)
            .get(endpoint + 'search/')
            .set('Accept', 'application/json')
            .set('token', token);
        expect(tmpRes.status).toEqual(404);
    }, 10000);

    // Test user in the database
    test("Test user in the database", async () => {
        expect(actualUser).toMatchObject({
            username: expectedUser.username,
            profilePicture: 'https://ui-avatars.com/api/?rounded=true'
        });
    }, 10000);


    // Test PUT /user/:username endpoint
    test("PUT /user/:username", async () => {

        let postRes = (await request(webapp)
            .post("/api/auth/register")
            .send({
                username: 'testUser2',
                password: 'testPassword2',
                email: 'testEmail2@gmail.com',
                firstName: 'testFirstName2',
                lastName: 'testLastName2',
                profilePicture: "https://ui-avatars.com/api/?rounded=true"
            })
            .set('Accept', 'application/json'));
        // Check if successfully post a new user.
        expect(postRes.status).toBe(200);
        const token2 = postRes.body.data.token;

        const putDeleteUsername = 'testUser2';

        const putRes = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                username: 'testUser2',
                password: 'testPassword2',
                email: 'updatedEmail@gmail.com'
            }).set('token', token2));
        // Type and status code check

        expect(putRes.status).toBe(200);
        expect(putRes.type).toBe('application/json');

        // resp body check
        expect(putRes._body.success).toBe(true);
        expect(putRes._body.data).toMatchObject({
            username: 'testUser2',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        });


        // Check missing body error
        const putRes2 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({username: 'testUser2'})
            .set('token', token2));

        expect(putRes2.status).toBe(500);
        expect(putRes2._body.success).toBe(false);


        // Missing password error
        const putRes4 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                username: 'testUser2',
                email: 'updatedEmail@gmail.com',
            })
            .set('token', token2));
        expect(putRes4.status).toBe(500);
        expect(putRes4._body.success).toBe(false);

        // Missing email error
        const putRes5 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                username: 'testUser2',
                password: 'testPassword2',
            })
            .set('token', token2));
        expect(putRes5.status).toBe(500);
        expect(putRes5._body.success).toBe(false);


        // Check if the user is updated in the database
        const updatedUser = await db.collection('user').findOne({username: `${putDeleteUsername}`});
        expect(updatedUser).toMatchObject({
            username: 'testUser2',
            password: 'testPassword2',
            email: 'updatedEmail@gmail.com',
            firstName: 'testFirstName2',
            lastName: 'testLastName2',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        });

        // Delete the user
        const deleteUser = await db.collection('user').deleteOne({username: `${putDeleteUsername}`});
        expect(deleteUser.deletedCount).toBe(1);
    }, 10000);

    // Test DELETE /user/:username endpoint
    test("DELETE /user/:username", async () => {
        // Create a new user
        const postRes = (await request(webapp)
            .post('/api/auth/register')
            .send({
                username: 'testUser2',
                password: 'testPassword2',
                email: 'testUser2Emaill@gmail.com',
                firstName: 'testFirstName2',
                lastName: 'testLastName2',
                profilePicture: "https://ui-avatars.com/api/?rounded=true"
            }));
        // Check if successfully post a new user.
        expect(postRes.status).toBe(200);

        const putDeleteUsername = 'testUser2';
        const putDeleteToken = postRes.body.data.token;

        // Test wrong username error
        const deleteRes = (await request(webapp)
            .delete(endpoint + 'wrongUsername')
            .set('token', putDeleteToken));
        expect(deleteRes.status).toBe(403);

        // Successfully delete
        const deleteRes2 = (await request(webapp)
            .delete(endpoint + `${putDeleteUsername}`)
            .set('token', putDeleteToken));

        expect(deleteRes2.status).toBe(200);
        expect(deleteRes2.type).toBe('application/json');
        expect(deleteRes2._body.success).toBe(true);
        expect(deleteRes2._body.data).toMatchObject({
            username: 'testUser2',
            password: 'testPassword2',
            email: 'testUser2Emaill@gmail.com',
            firstName: 'testFirstName2',
            lastName: 'testLastName2',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        });

        // Check if the user is deleted from the database
        const deletedUser = await db.collection('user').findOne({username: `${putDeleteUsername}`});
        expect(deletedUser).toBeNull();
    }, 10000);
})