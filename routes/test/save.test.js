const request = require('supertest');
const webapp = require('../../app');
const dbLib = require('../../db/dbFunction');
const {ObjectId} = require("mongodb");

const endpoint = '/api/post/';
let mongo;