const express = require("express");
const multer = require('multer');
const path = require("path");
const {SaveFileError} = require("../errors/saveError");
const {randomString} = require("../util/tool");

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: './storage/images',
    filename: (req, file, cb) => {
        cb(null, "media" + randomString(8) + '_' + Date.now()
            + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: imageStorage,
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
        res.status(200).json({
            status: "success",
            data: {
                file: file
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
                filename: file.filename,
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