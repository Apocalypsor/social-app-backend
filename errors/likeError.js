class LikeFailedToGetError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LikeFailedToGetError';
        this.status = 404;
    }
}

module.exports = {LikeFailedToGetError};