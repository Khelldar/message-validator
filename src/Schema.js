'use strict';
const _ = require('lodash');
const Field = require('./Field');



class Schema {
  constructor(properties, options) {
    if (!_.isObject(properties)) {
      throw new TypeError('first param: properties must be an object');
    }

    if (options != null && !_.isObject(options)) {
      throw new TypeError('second param: options must be an object');
    }

    // default options
    this.options = {
      extraProperties: false,
      required: false,
      array: false
    };
    _.assign(this.options, options || {});



    const errors = [];
    this.properties = {};
    _.each(properties, (property, propertyName) => {
      if (!(property instanceof Field || property instanceof Schema)) {
        errors.push(`${propertyName}: must be a Schema or a Field`);
        return;
      }

      this.properties[propertyName] = property;

    });

    if (errors.length > 0) {
      throw new TypeError(`The following schema properties are not valid:\n ${this._prettyArrayString(errors)}`);
    }

  }

  validate(message, options) {
    if (!_.isObject(message)) {
      throw new TypeError('message must be an object');
    }

    if (options != null && !_.isObject(options)) {
      throw new TypeError('options must be an object');
    }
    // default options
    options = {
      throwError: true
    };
    _.assign(this.options, options || {});

    // rolling collection of errors
    let errors = [];

    _.each(this.properties, (property, propertyName) => {
      if (property instanceof Schema && _.isObject(message[propertyName])) {
        errors = _.union(errors, property.validate(message[propertyName], { throwError: false }));
      }
    });

    // check for extra fields
    if (!this.options.extraProperties) {
      errors = _.union(errors, this._noExtra(message));
    }

    // check for wrong types
    errors = _.union(errors, this._fieldTypes(message));

    // check for required fields
    errors = _.union(errors, this._requiredFields(message));

    // custom validation
    errors = _.union(errors, this._customValidation(message));

    // format and throw the error
    if (errors.length > 0 && options.throwError) {
      const error = new Error(`The following rules are not met; ${this._prettyArrayString(errors)}`);
      error.name = 'BadRequest';
      error.statusCode = 400;
      throw error;
    }

    return errors;
  }

  toString(val) {
    let s = '';

    if (this.required) {
      s += '(required) ';
    }


    s += `must be an object`;


    return _.trim(s);
  }

  _noExtra(message) {
    const errors = [];
    _.each(message, (v, k) => {
      if (this.properties[k] == null) {
        errors.push(k);
      }
    });
    return errors.length > 0 ? [`extra fields are not allowed: ${errors}`] : [];
  }

  _fieldTypes(message) {
    const errors = [];
    _.each(message, (fieldValue, k) => {
      const schemaField = this.properties[k];
      if (schemaField != null && this._badType(schemaField, fieldValue)) {
        errors.push(`${k}: ${schemaField.toString(fieldValue)}`);
      }
    });
    return errors;
  }

  _badType(schemaField, value, skipArrayCheck) {
    const type = schemaField.type;
    if (value === null) { // nulls are ok for type checking.  represents deleting an optional field.
      return false;
    }
    else if (schemaField instanceof Schema) {
      if (!_.isObject(value)) {
        return true;
      }
    }
    else if (!skipArrayCheck && schemaField.array) {
      // make sure we have an array
      if (!_.isArray(value)) {
        return true;
      }
      // go through each value and make sure the array contains the right types
      // not crazy about this flag, but it lets us get recursive with having 'array' as a boolean property on Field
      return _.some(value, o => this._badType(schemaField, o, true));
    }
    else if (type === 'number' && !_.isFinite(value)) {
      return true;
    }
    else if (type === 'string' && !_.isString(value)) {
      return true;
    }
    else if (type === 'boolean' && !_.isBoolean(value)) {
      return true;
    }


    return false;
  }

  _requiredFields(message) {
    const errors = [];
    let groupsNotMet = [];
    const groupsMet = [];
    _.each(this.properties, (fieldProperties, fieldName) => {
      console.log(`performing requird check on ${fieldName}`)
      console.log(`fieldProperties.required: ${fieldProperties.required}`)
      if (fieldProperties.required === true && message[fieldName] == null) {
        errors.push(`${fieldName}: ${fieldProperties.toString()}`);
      }

      if (_.isString(fieldProperties.required)) {
        if (message[fieldName] == null) {
          groupsNotMet.push(fieldProperties.required);
        }
        else {
          groupsMet.push(fieldProperties.required);
        }
      }

    });

    groupsNotMet = _.uniq(groupsNotMet);
    _.each(groupsNotMet, (group) => {
      if (!_.contains(groupsMet, group)) {
        const groupFields = [];
        _.each(this.properties, (v, k) => {
          if (v.required === group) {
            groupFields.push(`${k}: ${v.toString()}`);
          }
        });
        errors.push(`One of the following fields is required: ${this._prettyArrayString(groupFields)}`);
      }
    });

    return errors;
  }

  _customValidation(message) {
    const errors = [];
    _.each(message, (fieldValue, k) => {
      const schemaField = this.properties[k];
      if (schemaField != null && schemaField.validation != null && !schemaField.validation(fieldValue)) {
        errors.push(`${k}: ${schemaField.toString(fieldValue)}`);
      }
    });
    return errors;
  }

  _prettyArrayString(array) {
    let s = '';
    _.each(array, (error) => {
      s += `${error}, `;
    });
    return _.trim(s, ', ');
  }

}

module.exports = Schema;
