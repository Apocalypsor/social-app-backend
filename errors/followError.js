class FollowerFailedToGetError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FollowerFailedToGetError';
        this.status = 500;
    }
}

module.exports = {
    FollowerFailedToGetError
};