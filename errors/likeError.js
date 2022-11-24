class LikeFailedToGetError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LikeFailedToGetError';
        this.status = 500;
    }
}

module.exports = LikeFailedToGetError;