var _ = require('lodash')


class Schema {
    constructor(options) {
        if (!_.isObject(options)) {
            throw new TypeError('schema constructor parameter must be an object');
        }

        if (options.throw != null && !_.isBoolean(options.throw)) {
            throw new TypeError('throw must be a boolean');
        }

        if (options.allowExtraProperties != null && !_.isBoolean(options.allowExtraProperties)) {
            throw new TypeError('allowExtraProperties must be a boolean');
        }

        if (options.type != null && !_.isString(options.type)) {
            throw new TypeError('type must be a string');
        }

        if (options.type != null && !_.isString(options.type)) {
            throw new TypeError('type must be a string');
        }

        if (options.array != null && !_.isBoolean(options.array)) {
            throw new TypeError('array must be a boolean');
        }

        if (options.required != null && !_.isBoolean(options.required)) {
            throw new TypeError('required must be a boolean');
        }

        if (options.properties != null && !_.isObject(options.properties)) {
            throw new TypeError('properties must be an object');
        }

        if (options.validation != null && !_.isFunction(options.validation)) {
            throw new TypeError('validation must be an must be a function that takes a value and return a boolean');
        }

        if ((options.type !== 'string' || options.type !== 'number' || options.type !== 'boolean') && this.properties != null) {
            throw new TypeError("cannot set properties on a primative");
        }

        if ((options.type !== 'string' || options.type !== 'number' || options.type !== 'boolean') && this.allowExtraProperties != null) {
            throw new TypeError("cannot set allowExtraProperties on a primative");
        }




        this._options = options;
    }

    required() {
        let clone = new Schema(this._options);
        clone._options.required = true;
        return clone;
    }

    array() {
        let clone = new Schema(this._options);
        clone._array.required = true;
        return clone;
    }

    validate(val) {
        var errors = [];
        var { array } = this._options;

        //required check - this is done up here because it doesn't matter whether something is an array or not
        if (val == null) {
            return [`this is a required field`];
        }

        //the goal here is to stop dealing with arrays as soon as possible.
        //these conditionals are kind of gross, but the helpers end up looking way better
        var errors = [];
        if (array) { //working with an array
            if (!_.isArray(val)) {
                return [`${val} is not an array`];
            }
            //iterate over each elem in the array and run all validation
            _.each(val, (elem) => {
                errors = _.union(errors, this._validateSingleValue(elem));
            });
        } else { //working with a single value
            errors = _.union(errors, this._validateSingleValue(val));
        }

        return errors;
    }

    _validateSingleValue(val) {
        var errors = [];
        var { properties } = this._options

        //type check
        errors = _.union(errors, this._typeCheck(val));

        //properties
        errors = _.union(errors, this._propertiesCheck(val));

        //custom validation
        errors = _.union(errors, this._customValidationCheck(val));

        return errors;
    }

    _typeCheck(val) {
        var { type } = this._options;
        if (!isType(type, val)) {
            return [`${val} is not a valid ${type}`];
        }
    }

    _propertiesCheck(val) {
        var errors = [];
        var { properties } = this._options
        if (properties == null) {
            return errors;
        }

        _.each(properties, (property, propertyName) => {
            errors = _.union(errors, property.validate(val[propertyName]));
        });

        return errors;
    }

    _customValidationCheck(val) {
        var errors = [];
        var { validation } = this._options;
        if (validation == null) {
            return errors;
        }

        if (!validation(val)) {
            errors.push('something')
        }

        return errors;
    }

}

function isType(type, val) {
    switch (type) {
        case 'string':
            return _.isString(val);
        case 'number':
            return _.isNumber(val);
        case 'boolean':
            return _.isBoolean(val);
        default:
            return _.isObject(val);
    }
}




module.exports = Schema