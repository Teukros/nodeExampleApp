const KeyGrip = require('keygrip');
const key = require('../../config/keys');
const keygrip = new KeyGrip([key.cookieKey]);

module.exports = user => {
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    };
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sig = keygrip.sign('session=' + session);
    return {session, sig}
}