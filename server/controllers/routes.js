// See documentation on https://github.com/frankrousseau/americano#routes

var index = require('./index');

module.exports = {
  'getAllDay/:day': {
    get: index.byDay
  },
  'getImportant': {
    get: index.mostImportant
  }
};

