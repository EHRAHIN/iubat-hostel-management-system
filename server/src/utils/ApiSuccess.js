class ApiSuccess {
  constructor(message = 'Success', data = null, statusCode = 200) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiSuccess;
module.exports.default = ApiSuccess;
