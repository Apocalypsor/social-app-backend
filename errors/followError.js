class FollowerFailedToGetError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FollowerFailedToGetError';
        this.status = 404;
    }
}

module.exports = {
    FollowerFailedToGetError
};