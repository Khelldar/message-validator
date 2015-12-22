'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonStubPromise = require('sinon-promises');
const chaiAsPromised = require('chai-as-promised');
const Schema = require('./..').Schema;

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

    it('should default to extraFields = false', () => {
      schema = new Schema({});
      expect(schema.options.extraFields).to.be.false;
    });


    it('should call the Field constructor', () => {
      // TODO
    });

    it('should build up a fields hash', () => {
      schema = new Schema({ a: { type: 'string' } });
      expect(schema.fields.a.type).to.equal('string');
    });

  });

  describe('#validate', () => {
    let schema, message;
    describe('extraFields', () => {
      beforeEach(() => {
        message = {};
      });

      it('should error if message is not an object', () => {
        expect(() => {
          schema = new Schema({
            a: {
              type: 'string'
            }
          });
          schema.validate('dafsdas');
        }).to.throw('object');
      });

      it('should error if there are extra fields', () => {
        schema = new Schema({
          a: {
            type: 'string'
          }
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
          a: {
            type: 'string'
          }
        }, { extraFields: true });
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
          a: {
            type: 'string',
          },
          b: {
            type: 'number',
          },
          c: {
            type: 'boolean',
          },
          d: {
          },
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
          a: {
            type: 'string',
            required: true,
          },
          b: {
            type: 'string',
            required: true,
          },
          c: {
            type: 'string',
          },
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
          a: {
            type: 'string',
            required: '1',
          },
          b: {
            type: 'string',
            required: '1',
          },
          c: {
            type: 'string',
            required: '2',
          },
          d: {
            type: 'string',
            required: '2',
          }
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
          a: {
            type: 'string',
            validation: (val) => {
              return val.length <= 2;
            }
          }
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

    describe('real world', () => {

    });

  });

});
