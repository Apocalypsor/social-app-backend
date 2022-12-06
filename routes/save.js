const express = require("express");
const multer = require('multer');
const multerS3 = require('multer-s3')
const path = require("path");
const {SaveFileError} = require("../errors/saveError");
const {S3Client} = require('@aws-sdk/client-s3')

require('dotenv').config();

const router = express.Router();

const r2 = new S3Client(
    {
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCOUNT_KEY,
            secretAccessKey: process.env.R2_ACCOUNT_SECRET,
        },
        signatureVersion: 'v4',
    }
)

const upload = multer({
    storage: multerS3({
        s3: r2,
        bucket: process.env.R2_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname.split('.').pop())
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    limits: {
        fileSize: 1000000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg|webp|mp4)$/)) {
            return cb(new Error('Please upload a Image or Video'))
        }
        cb(undefined, true)
    }
});

router.post('/one', upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            next(new SaveFileError("File not found"));
            return;
        }

        const resp = {
            url: process.env.R2_PUBLIC_URL + "/" + file.key,
            type: file.mimetype.startsWith('image/') ? 0 : 1,
        }

        res.status(200).json({
            status: "success",
            data: {
                file: resp
            }
        });
    } catch (e) {
        next(e);
    }
});

router.post('/multiple', upload.array('file[]'), async (req, res, next) => {
    try {
        let files = [];
        for (let file of req.files) {
            files.push({
                url: process.env.R2_PUBLIC_URL + "/" + file.key,
                type: file.mimetype.startsWith('image/') ? 0 : 1,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                file: files
            }
        })
    } catch {
        next(new SaveFileError('Error saving file'));
    }

});

router.get('/serve/:filename', (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '../storage/images/' + req.params.filename));
    } catch {
        next(new SaveFileError('Error serving file'));
    }
});

module.exports = router;