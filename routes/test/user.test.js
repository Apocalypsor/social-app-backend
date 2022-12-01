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
        mongo = await dbLib.connect('test');
        db = await dbLib.getDb();
        res = (await request(webapp)
            .post(endpoint)
            .send({
                username: 'testUser',
                password: 'testPassword',
                email: 'testEmail@gmail.com',
                firstName: 'testFirstName',
                lastName: 'testLastName',
                profilePicture: "https://ui-avatars.com/api/?rounded=true"
            })
            .set('Accept', 'application/json'));
        // res = JSON.parse(res.text);


        if (res._body.success) {
            actualUser = res._body.data;

        } else {
            console.log("Create user failed");
        }
    });

    afterAll(async () => {
       await clearDatabase();
        try {
            await dbLib.close();  // close the connection to the database
        } catch (err) {
            return err;
        }
    });


    const clearDatabase = async () => {
        try {
            if(actualUser._id instanceof ObjectId){
                actualUser._id = actualUser._id.toString();
            }
            const result = await deleteObjectById(db, 'user', actualUser._id);

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
            .set('Accept', 'application/json');


        expect(res.header["content-type"]).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/json');
        expect(res._body).toMatchObject(expectedResp);

        // Test no username.
        const tmpRes = await request(webapp)
            .get(endpoint + '')
            .set('Accept', 'application/json');
        expect(tmpRes.status).toEqual(404);
    });


    // Test GET /user/search/:username endpoint
    test("GET /user/search/:username", async () => {
        const res = await request(webapp)
            .get(endpoint + `search/${actualUser.username}`)
            .set('Accept', 'application/json');

        expect(res.header["content-type"]).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/json');
        expect(res._body.data[0]).toMatchObject(expectedUser);

        // No need to test Wrong Username.
        const tmpRes = await request(webapp)
            .get(endpoint + 'search/')
            .set('Accept', 'application/json');
        expect(tmpRes.status).toEqual(404);
    });

    /**
     *  Test POST /user
     * */
    test("POST /user", async () => {
        // Status code and content type
        expect(res.status).toBe(200);
        expect(res.type).toBe('application/json');

        // Response body
        expect(res._body).toMatchObject(expectedResp);
    })
    // Test user in the database
    test("Test user in the database", async () => {
        const insertedUser = await db.collection('user').findOne({_id: ObjectId(actualUser._id)});
        expect(insertedUser).toMatchObject(expectedUser);
    });

    // Test missing a field.
    test("POST /user missing a field", async () => {
        const tmpRes = (await request(webapp)
                    .post(endpoint)
                    .send({
                        username: 'testUser2',
                        password: 'testPassword2',
                        // email: 'testEmail2@gmail.com',
                        firstName: 'testFirstName2',
                        lastName: 'testLastName2',
                        profilePicture: "https://ui-avatars.com/api/?rounded=true"
                    })
                    .set('Accept', 'application/json'));
        const tmpResJson = JSON.parse(tmpRes.text);
        expect(tmpResJson.success).toBe(false);
        expect(tmpRes.status).toBe(500);
    });

    // Test PUT /user/:username endpoint
    test("PUT /user/:username", async () => {

        const postRes = (await request(webapp)
            .post(endpoint)
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

        const putDeleteUsername = 'testUser2';
        const putDeleteUserId = postRes._body.data._id;

        const putRes = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                username: 'testUser2',
                password: 'testPassword2',
                email: 'updatedEmail@gmail.com'
            }));
        // Type and status code check
        expect(putRes.status).toBe(200);
        expect(putRes.type).toBe('application/json');

        // resp body check
        expect(putRes._body.success).toBe(true);
        expect(putRes._body.data).toMatchObject({
            username: 'testUser2',
            password: 'testPassword2',
            email: 'updatedEmail@gmail.com',
            firstName: 'testFirstName2',
            lastName: 'testLastName2',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        });


        // Check missing body error
        const putRes2 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({}));
        expect(putRes2.status).toBe(500);
        expect(putRes2._body.success).toBe(false);

        // Missing username error
        const putRes3 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                password: 'testPassword2',
                email: 'updatedEmail@gmail.com',
            }));
        expect(putRes3.status).toBe(500);
        expect(putRes3._body.success).toBe(false);

        // Missing password error
        const putRes4 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                username: 'testUser2',
                email: 'updatedEmail@gmail.com',
            }));
        expect(putRes4.status).toBe(500);
        expect(putRes4._body.success).toBe(false);

        // Missing email error
        const putRes5 = (await request(webapp)
            .put(endpoint + `${putDeleteUsername}`)
            .send({
                username: 'testUser2',
                password: 'testPassword2',
            }));
        expect(putRes5.status).toBe(500);
        expect(putRes5._body.success).toBe(false);


        // Check if the user is updated in the database
        const updatedUser = await db.collection('user').findOne({_id: ObjectId(putDeleteUserId)});
        expect(updatedUser).toMatchObject({
            username: 'testUser2',
            password: 'testPassword2',
            email: 'updatedEmail@gmail.com',
            firstName: 'testFirstName2',
            lastName: 'testLastName2',
            profilePicture: "https://ui-avatars.com/api/?rounded=true"
        });

        // Delete the user
        const deleteUser = await db.collection('user').deleteOne({_id: ObjectId(putDeleteUserId)});
        expect(deleteUser.deletedCount).toBe(1);
    });

    // Test DELETE /user/:username endpoint
    test("DELETE /user/:username", async () => {
        // Create a new user
        const postRes = (await request(webapp)
            .post(endpoint)
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
        const putDeleteUserId = postRes._body.data._id;

        // Test wrong username error
        const deleteRes = (await request(webapp)
            .delete(endpoint + 'wrongUsername'));
        expect(deleteRes.status).toBe(500);

        // Successfully delete
        const deleteRes2 = (await request(webapp)
            .delete(endpoint + `${putDeleteUsername}`));

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
        const deletedUser = await db.collection('user').findOne({_id: putDeleteUserId});
        expect(deletedUser).toBeNull();
    });
})