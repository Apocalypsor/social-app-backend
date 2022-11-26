class SaveFileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SaveFileError';
    this.status = 500;
  }
}

module.exports = {SaveFileError};