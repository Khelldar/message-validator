// 'use strict';
// const _ = require('lodash');

// class MessageValidator {
//   constructor(schema) {
//     this._schema = schema;
//   }

//   validate(input) {
//     const errors = [];
//     _.each(this._schema, (propDefinition, propName) => {
//       if (_.isUndefined(input[propName])) {
//         errors.push(`${propName} is required`);
//       }
//     });

//     if (errors.length > 0) {
//       throw new Error(JSON.stringify(errors));
//     }
//   }
// }

// module.exports = MessageValidator;
