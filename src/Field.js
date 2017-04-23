'use strict';
const _ = require('lodash');

class Field {
  constructor(options) {
    if (options != null) {
      if (options.type != null && !_.isObject(options)) {
        throw new TypeError('constructor parameter must be an object');
      }

      if (options.type != null && !(options.type === 'string' || options.type === 'number'  || options.type === 'boolean')) {
        throw new TypeError('type is required must be a string equal to number, string, boolean, array, or schema');
      }

      if (options.array != null && !_.isBoolean(options.array)) {
        throw new TypeError('array must be a boolean');
      }

      if (options.required != null && (!_.isBoolean(options.required) && !_.isString(options.required))) {
        throw new TypeError('required must be a boolean or a string');
      }

      if (options.validation != null && !_.isFunction(options.validation)) {
        throw new TypeError('validation must be a function');
      }

      if (options.rules != null && !_.isString(options.rules)) {
        throw new TypeError('rules must be a string');
      }

      if (options.error != null && !_.isFunction(options.error)) {
        throw new TypeError('error must be a function that returns a string');
      }

    }

    // defaults
    this.required = false;

    _.assign(this, options);
  }

  isRequired(group) {
    const clone = new Field(this);
    clone.required = group || true;
    return clone;
  }

  toString(val) {
    let s = '';

    if (this.required) {
      s += '(required) ';
    }

    if (this.type) {
      s += `(${this.type}) `;
    }

    if (val != null && this.error) {
      s += `[${this.error(val)}] `;
    }

    if (this.rules != null) {
      s += this.rules;
    }

    return _.trim(s);
  }

}

module.exports = Field;
