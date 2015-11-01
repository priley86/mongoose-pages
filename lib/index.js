
exports.anchor = function (schema) {
    schema.statics.findPaginated = require('./anchor.js');
};

exports.skip = function (schema) {
    schema.statics.findPaginated = require('./skip.js');
};

exports.geoPaginate = function (schema) {
    schema.statics.findGeoPaginate = require('./geoPaginate.js');
};