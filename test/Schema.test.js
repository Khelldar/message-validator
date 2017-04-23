'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonStubPromise = require('sinon-promises');
const chaiAsPromised = require('chai-as-promised');
const Schema = require('./..').Schema;
const Field = require('./..').Field;

sinonStubPromise(sinon);
chai.use(chaiAsPromised);
chai.use(sinonChai);

const expect = chai.expect;

function _trapError(func) {
  try {
    func();
  }
  catch (err) {
    return err;
  }
}

describe('Schema', () => {
  describe('#constructor', () => {
    let schema;
    beforeEach(() => {
      schema = null;
    });

    it('should error if fields is not an object', () => {
      expect(() => {
        schema = new Schema();
      }).to.throw('first');
    });

    it('should error if options is defined and is not an object', () => {
      expect(() => {
        schema = new Schema({}, 'jklasjfkd');
      }).to.throw('second');
    });

    it('should default to extraProperties = false', () => {
      schema = new Schema({});
      expect(schema.options.extraProperties).to.be.false;
    });

    it('should build up a fields hash', () => {
      schema = new Schema({ a: new Field({ type: 'string' }) });
      expect(schema.properties.a.type).to.equal('string');
    });

  });

  describe('#validate', () => {
    let schema, message;
    describe('extraProperties', () => {
      beforeEach(() => {
        message = {};
      });

      it('should error if message is not an object', () => {
        expect(() => {
          schema = new Schema({
            a: new Field({
              type: 'string'
            })
          });
          schema.validate('dafsdas');
        }).to.throw('object');
      });

      it('should error if there are extra fields', () => {
        schema = new Schema({
          a: new Field({
            type: 'string'
          })
        });
        message.a = 'asdf';
        message.b = 'asdf';
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('extra fields');

      });

      it('should not error error if there are extra fields allowed', () => {
        schema = new Schema({
          a: new Field({
            type: 'string'
          })
        }, { extraProperties: true });
        message.a = 'asdf';
        message.b = 'asdf';
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

    });

    describe('fieldTypes', () => {
      beforeEach(() => {
        message = {};
        schema = new Schema({
          a: new Field({
            type: 'string',
          }),
          b: new Field({
            type: 'number',
          }),
          c: new Field({
            type: 'boolean',
          }),
          d: new Field({
          }),
        });
      });

      it('should error if any of the fields are the wrong type - 1', () => {
        message.a = 1;
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('string');
      });

      it('should error if any of the fields are the wrong type - 2', () => {
        message.b = 'asdf';
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('number');
      });

      it('should error if any of the fields are the wrong type - 3', () => {
        message.c = 1;
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('boolean');
      });

      it('should error if any of the fields are the wrong type - 4', () => {
        message.a = 1;
        message.b = 'asfd';
        message.c = 1;
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('string')
        .and.to.contain('number')
        .and.to.contain('boolean');
      });

      it('should not error if an optional field is null', () => {
        message.a = null;
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

      it('should not error if an untyped field is a string', () => {
        message.d = 'asdf';
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

      it('should not error if an untyped field is a number', () => {
        message.d = 123;
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

      it('should not error if an untyped field is a boolean', () => {
        message.d = false;
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

    });

    describe('requiredFields', () => {
      beforeEach(() => {
        message = {};
        schema = new Schema({
          a: new Field({
            type: 'string',
            required: true,
          }),
          b: new Field({
            type: 'string',
            required: true,
          }),
          c: new Field({
            type: 'string',
          }),
        });
      });

      it('should error if more than one required field is missing', () => {
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('a:')
        .and.to.contain('b:')
        .and.to.contain('required');
      });

      it('should error if one required field is missing', () => {
        message.a = 'aasdf';
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('b:')
        .and.to.contain('required')
        .and.to.not.contain('a:');
      });

      it('should error if one any required field is null', () => {
        message.a = 'aasdf';
        message.b = null;
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('b:')
        .and.to.contain('required')
        .and.to.not.contain('a:');
      });

      it('should not error if an optional field is missing', () => {
        message.a = 'asdf';
        message.b = 'safd';
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

      it('should not error if an optional field is null', () => {
        message.a = 'asdf';
        message.b = 'safd';
        message.c = null;
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

    });

    describe('require groups', () => {
      beforeEach(() => {
        message = {};
        schema = new Schema({
          a: new Field({
            type: 'string',
            required: '1',
          }),
          b: new Field({
            type: 'string',
            required: '1',
          }),
          c: new Field({
            type: 'string',
            required: '2',
          }),
          d: new Field({
            type: 'string',
            required: '2',
          })
        });
      });

      it('errors if nothing in the group is present', () => {
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('a:')
        .and.to.contain('b:')
        .and.to.contain('c:')
        .and.to.contain('d:');
      });

      it('errors if nothing in the group is present', () => {
        message.b = 'asdf';
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('c:')
        .and.to.contain('d:');
      });

      it('is fine if one in the group is present', () => {
        message.a = 'asdf';
        message.d = 'asdf';
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

      it('is fine if all in the group are present', () => {
        message.a = 'asdf';
        message.b = 'asdf';
        message.c = 'asdf';
        message.d = 'asdf';
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

    });

    describe('custom validation', () => {
      beforeEach(() => {
        message = {};
        schema = new Schema({
          a: new Field({
            type: 'string',
            validation: (val) => {
              return val.length <= 2;
            }
          })
        });
      });

      it('should error if custom validation fails', () => {
        message.a = 'aasdf';
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('a:');
      });

      it('should not error if an custom validation passes', () => {
        message.a = 'ab';
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

    });

    describe('schemas with arrays', () => {
      let schema, message;
      beforeEach(() => {
        message = {};
      });

      schema = new Schema({
        list: new Field({ type: 'string', array: true })
      });

      it('should error if schema wants an array, but the message has some other type', () => {
        message.list = 'asdf';
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('list:');
      });

      it('should error if the schema wants an array of strings, but the message has an array of numbers', () => {
        message.list = [1, 2, 3];
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('list:');
      });

      it('should error if the array on the message has mixed types', () => {
        message.list = ['one', 'two', 3];
        const e = _trapError(() => {
          schema.validate(message);
        });
        expect(e.message).to.contain('list:');
      });

      it('empty arrays should not cause an error', () => {
        message.list = [];
        expect(() => {
          schema.validate(message);
        }).to.not.throw();
      });

    });

    describe('properties', () => {
      let schema;

      it('should error if any properties of a schema are not a Field or Schema', () => {
        expect(() => {
          schema = new Schema({
            something: '123',
          });
        }).to.throw('something');
      });
    });

    describe('schemas with schemas', () => {
      let ticketSchema, personSchema, message;
      beforeEach(() => {
        message = {};
      });

      personSchema = new Schema({
        name: new Field({type: 'string' }),
        age: new Field({
          type: 'number',
          rules: 'must be greater than or equal to 0',
          validation: (val) => {
            return val >= 0;
          }
        }),
      });


      ticketSchema = new Schema({
        title: new Field({type: 'string'}),
        owner: personSchema,
      });

      it('should error as normal with non-schema fields', () => {
        message = {
          title: [],
          owner: {
            name: 'Jon',
            age: 22,
          }
        };

        const e = _trapError(() => {
          ticketSchema.validate(message);
        });
        expect(e.message).to.contain('title:');
      });

      it('should error if a netsted object is expected but something else is passed in', () => {
        message = {
          title: 'This Sure is a Title',
          owner: 'asdf',
        };

        const e = _trapError(() => {
          ticketSchema.validate(message);
        });
        expect(e.message).to.contain('owner:');
      });

      it('should error if there are bad properties on nested objects', () => {
        message = {
          title: 'This Sure is a Title',
          owner: {
            name: 123,
            age: -100
          },
        };

        const e = _trapError(() => {
          ticketSchema.validate(message);
        });
        console.log(e.message);
        expect(e.message).to.contain('name:');
        expect(e.message).to.contain('age:');
      });

      //TODO: relationship between schema and field is bad right now, rework to make this sane
      it.skip('should error if a netsted object required but not passed in', () => {
        message = {
          title: 'This Sure is a Title',
        };

        const e = _trapError(() => {
          ticketSchema.validate(message);
        });
        expect(e.message).to.contain('owner:');
      });

    });

  });

});
