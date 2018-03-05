const crypto = require('crypto'); // 加密模块
module.exports = function(text) {
    return crypto.createHash('MD5').update(text, 'utf8').digest('base64'); // [base64, hex]
}
