// 'use strict';
// const chai = require('chai');
// const sinon = require('sinon');
// const sinonChai = require('sinon-chai');
// const sinonStubPromise = require('sinon-promises');
// const chaiAsPromised = require('chai-as-promised');
// const Field = require('./..').Field;

// sinonStubPromise(sinon);
// chai.use(chaiAsPromised);
// chai.use(sinonChai);

// const expect = chai.expect;

// describe('Field', () => {
//   describe('#constructor', () => {
//     let field;
//     beforeEach(() => {
//       field = null;
//     });

//     it('should error if type is not a string', () => {
//       expect(() => {
//         field = new Field({ type: 1 });
//       }).to.throw('string');
//     });

//     it('should error if type is not one of the five allowed types', () => {
//       expect(() => {
//         field = new Field({ type: 'boggle' });
//       }).to.throw('string');
//     });

//     it('should error if required is defined, but is not a boolean or a string', () => {
//       expect(() => {
//         field = new Field({ type: 'string', required: 1 });
//       }).to.throw('boolean');
//     });

//     it('should error if validation is defined, but is not a function', () => {
//       expect(() => {
//         field = new Field({ type: 'string', validation: 1 });
//       }).to.throw('function');
//     });

//     it('should error if rules is defined, but is not a string', () => {
//       expect(() => {
//         field = new Field({ type: 'string', rules: 1 });
//       }).to.throw('string');
//     });

//     it('should error if error is defined, but is not a function', () => {
//       expect(() => {
//         field = new Field({ type: 'string', error: 1 });
//       }).to.throw('function');
//     });

//     it('should default to required = false', () => {
//       field = new Field({ type: 'string' });
//       expect(field.required).to.be.false;
//     });

//     it('extra field properties should not cause errors and be assigned', () => {
//       field = new Field({ type: 'string', boggle: () => 'at the situation' });
//       expect(field.boggle()).to.eql('at the situation');
//     });

//     it('should throw an error if array is aything other than a boolean', () => {
//       expect(() => {
//         field = new Field({ type: 'string', array: 'asdf' });
//       }).to.throw('array must be a boolean');
//     });

//   });

//   describe('#isRequired', () => {
//     it('should return an instance of Field', () => {
//       const field = new Field();
//       expect(field.isRequired()).to.be.instanceOf(Field);
//     });

//     it('should turn a non-required field required', () => {
//       const field = (new Field()).isRequired();
//       expect(field.required).to.be.true;
//     });

//     it('should not change an already required field', () => {
//       const field = (new Field({ required: true })).isRequired();
//       expect(field.required).to.be.true;
//     });

//     it('should not change other properties like type', () => {
//       const field = (new Field({ type: 'string', boggle: 1 })).isRequired();
//       expect(field.type).to.be.equal('string');
//       expect(field.boggle).to.be.equal(1);
//     });

//   });

//   describe('#toString', () => {
//     it('should include type', () => {
//       const field = new Field({ type: 'string' });
//       expect(field.toString()).to.contain('string');
//     });

//     it('should include required if required', () => {
//       const field = new Field({ type: 'string', required: true });
//       expect(field.toString()).to.contain('required');
//     });

//     it('should include rules if there are any', () => {
//       const ruleString = 'must be in bed by 10';
//       const field = new Field({ type: 'string', required: true, rules: ruleString });
//       expect(field.toString()).to.contain(ruleString);
//     });

//     it('should include the error message with the value passed in if there are any', () => {
//       const ruleString = 'must be in bed by 10';
//       const errorFunction = (val) => `${val} is not a valid bedtime`;
//       const field = new Field({ type: 'string', required: true, rules: ruleString, error: errorFunction });
//       expect(field.toString(12)).to.contain('12 is not a valid bedtime');
//     });

//   });


// });
