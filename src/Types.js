'use strict';
const _ = require('lodash');

module.exports = {
  string: {
    identifier: _.isString,
    // equals: (a, b) => {
    //   return a === b;
    // }
  },
// Number: {
//   ctor: Number,
//   string: 'number',
//   identifier: _.isNumber,
//   parser: parseFloat,
//   comparator: function(a, b) {
//     return a === b;
//   },
//   equals: function(a, b) {
//     return a === b;
//   }
// },
// Integer: {
//   string: 'integer',
//   identifier: function(val) {
//     return _.isNumber(val) && val % 1 === 0;
//   },
//   parser: parseInt,
//   equals: function(a, b) {
//     return a === b;
//   }
// },
// Date: {
//   ctor: Date,
//   string: 'date',
//   identifier: _.isDate,
//   parser: function(val) {
//     return new Date(val);
//   },
//   equals: function(a, b) {
//     return (a != null ? a.valueOf() : void 0) === (b != null ? b.valueOf() : void 0);
//   }
// },
// Boolean: {
//   ctor: Boolean,
//   string: 'boolean',
//   identifier: _.isBoolean,
//   parser: function(val) {
//     return !!val;
//   },
//   equals: function(a, b) {
//     return a === b;
//   }
// }
};
