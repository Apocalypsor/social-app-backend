const request = require('supertest');
const FormData = require('form-data');
const webapp = require('../../app');
const fs = require('fs');

const endpoint = '/api/save/';

const sourcePath = './routes/test/tmpFiles/'

// TEST /save endpoints
describe('TEST save endpoints', () => {

    let formDataMany;
    let formDataOne;

    beforeEach(async () => {
        try {
            if (!fs.existsSync(sourcePath)) {
                fs.mkdirSync(sourcePath);
            }

            await fs.writeFile(sourcePath + 'testFile1.jpg', 'test', (err) => {
                if (err) throw err;
            });
            await fs.writeFile(sourcePath + 'testFile2.jpg', 'test', (err) => {
                if (err) throw err;
            });
        } catch (err) {

        }

        formDataMany = new FormData();
        formDataOne = new FormData();

        formDataMany.append('file[]', fs.createReadStream(sourcePath + 'testFile1.jpg'));
        formDataMany.append('file[]', fs.createReadStream(sourcePath + 'testFile2.jpg'));

        formDataOne.append('file', fs.createReadStream(sourcePath + 'testFile1.jpg'));
    }, 10000);

    afterEach(async () => {
        await fs.unlink(sourcePath + 'testFile1.jpg', (err) => {
            if (err) throw err;
        });
        await fs.unlink(sourcePath + 'testFile2.jpg', (err) => {
            if (err) throw err;
        });
        if (fs.existsSync(sourcePath)) {
            fs.rmSync(sourcePath, {recursive: true, force: true});
        }
    }, 10000);

    // Test POST /save/one endpoint
    test('Test POST /save/one endpoint', async () => {
        const res = await request(webapp)
            .post(endpoint + 'one')
            .send({formDataOne});


        expect(res.status).toBe(403);
        expect(res._body.success).toBe(false);
        expect(res._body.message).toBe("No token provided.");
    }, 10000);

    test('Test POST /save/multiple endpoint', async () => {
        const res = await request(webapp)
            .post(endpoint + 'multiple')
            .send({formDataOne});


        expect(res.status).toBe(403);
        expect(res._body.success).toBe(false);
        expect(res._body.message).toBe("No token provided.");
    }, 10000);


});