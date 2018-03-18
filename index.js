
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/hotkeys.common.min.js');
} else {
  module.exports = require('./dist/hotkeys.common.js');
}
