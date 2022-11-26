const request = require('supertest');
const dbLib = require('../db/dbFunction');
const webapp = require('../app');
const {deleteObjectById} = require("../db/dbFunction");
const {ObjectId} = require("mongodb");


const endpoint = "http://localhost:4000/api/user/";
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
        res = await request(webapp)
                    .post(endpoint)
                    .send({
                        username: 'testUser',
                        password: 'testPassword',
                        email: 'testEmail@gmail.com',
                        firstName: 'testFirstName',
                        lastName: 'testLastName',
                        profilePicture: "https://ui-avatars.com/api/?rounded=true"})
                    .set('Accept', 'application/json');
        if(res.success){
            actualUser = res.data;
            console.log("actualUser: ", JSON.stringify(actualUser));
        }else{
            console.log("Failed to create test user");
        }
    });

    afterAll(async () => {
       await clearDatabase();
        try {
            await mongo.close(); // close the mongo connection
            await dbLib.close();  // Close the connection to the database
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
            console.log('result', result);
        } catch (err) {
            console.log('error', err.message);
        }
    };

    test("GET /user/:username", async () => {

        const res = await request(webapp)
                        .get( endpoint + `${actualUser.username}`)
                        .set('Accept', 'application/json');
        expect(res.headers["Content-Type"]).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/json');
        expect(JSON.parse(res.text).data).toMatchObject(expectedResp);
    });

    test("GET /user/search/:username", () => {
        const res = request(webapp)
                    .get(endpoint + `/search/${actualUser.username}`)
                    .set('Accept', 'application/json');
        expect(res.headers["Content-Type"]).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.type).toBe('application/json');
        expect(JSON.parse(res.text).data).toMatchObject(expectedResp);


    });





})