const request = require('supertest');
const dbLib = require('../../db/dbFunction');
const webapp = require('../../app');
const {deleteObjectById} = require("../../db/dbFunction");
const {ObjectId} = require("mongodb");

const endpoint = "/api/comment/";
let mongo;

// TEST comment endpoints
// describe("Test the comment endpoints", () => {
//
// });