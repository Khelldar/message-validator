'use strict';
const _ = require('lodash');
const Field = require('./Field');



class Schema {
  constructor(fields, options) {
    if (!_.isObject(fields)) {
      throw new TypeError('first param: fields must be an object');
    }

    if (options != null && !_.isObject(options)) {
      throw new TypeError('second param: options must be an object');
    }

    // default options
    this.options = {
      extraFields: false
    };
    _.assign(this.options, options || {});

    const errors = [];
    this.fields = {};//todo - rename to properties.  Field class stays, since that represents primatives.  'Property' can be a field or another schema
    _.each(fields, (fieldOptions, fieldName) => {
      console.log("fieldName: " +fieldName);
      if (fieldOptions instanceof Field) {//if this is type Field
        this.fields[fieldName] = new Field(fieldOptions);
      } else if (fieldOptions instanceof Schema) { //if this is type of Schema
        this.fields[fieldName] = new Schema(fieldOptions);
      } else {
        errors.push(`${fieldName}: must be a Schema or a Field`);
      }
    });

    if (errors.length > 0) {
      throw new TypeError(`The following schema properties are not valid:\n ${this._prettyArrayString(errors)}`);
    }

  }

  validate(message) {
    if (!_.isObject(message)) {
      throw new TypeError('message must be an object');
    }

    // rolling collection of errors
    let errors = [];

    // check for extra fields
    if (!this.options.extraFields) {
      errors = _.union(errors, this._noExtra(message));
    }

    // check for wrong types
    errors = _.union(errors, this._fieldTypes(message));

    // check for required fields
    errors = _.union(errors, this._requiredFields(message));

    // custom validation
    errors = _.union(errors, this._customValidation(message));

    // format and throw the error
    if (errors.length > 0) {
      const error = new Error(`The following rules are not met; ${this._prettyArrayString(errors)}`);
      error.name = 'BadRequest';
      error.statusCode = 400;
      throw error;
    }
  }

  _noExtra(message) {
    const errors = [];
    _.each(message, (v, k) => {
      if (this.fields[k] == null) {
        errors.push(k);
      }
    });
    return errors.length > 0 ? [`extra fields are not allowed: ${errors}`] : [];
  }

  _fieldTypes(message) {
    const errors = [];
    _.each(message, (fieldValue, k) => {
      console.log(k);
      const schemaField = this.fields[k];
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
    else if (!skipArrayCheck && schemaField.array) {
      // make sure we have an array
      if (!_.isArray(value)) {
        return true;
      }
      // go through each value and make sure the array contains the right types
      return _.some(value, o => this._badType(schemaField, o, true));//not crazy about this flag
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
    _.each(this.fields, (fieldProperties, fieldName) => {
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
        _.each(this.fields, (v, k) => {
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
      const schemaField = this.fields[k];
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
