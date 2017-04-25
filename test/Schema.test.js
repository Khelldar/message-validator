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
            }).to.throw('object');
        });

        //TODO: full type validation on options....or just learn typescript

    });

    describe('#type validation', () => {
        let schema, message, errors;
        beforeEach(() => {
            schema = null;
            message = null;
            errors = null;
        });


        describe('string', () => {

            beforeEach(() => {
                schema = new Schema({
                    type: 'string',
                });
            })

            it('invalid', () => {
                message = 123;
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('string')
            });

            it('valid', () => {
                message = 'asdf';
                errors = schema.validate(message);
                expect(errors).to.have.lengthOf(0)
            });

        });

        describe('number', () => {

            beforeEach(() => {
                schema = new Schema({
                    type: 'number',
                });
            })

            it('invalid', () => {
                message = 'asdf';
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('number')
            });

            it('valid', () => {
                message = 123;
                errors = schema.validate(message);
                expect(errors).to.have.lengthOf(0)
            });

        });

        describe('boolean', () => {

            beforeEach(() => {
                schema = new Schema({
                    type: 'boolean',
                });
            })

            it('invalid', () => {
                message = 'asdf';
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('boolean')
            });

            it('valid', () => {
                message = true;
                errors = schema.validate(message);
                expect(errors).to.have.lengthOf(0)
            });

        });

        describe('array of strings', () => {

            beforeEach(() => {
                schema = new Schema({
                    type: 'string',
                    array: true,
                });
            })

            it('invalid1', () => {
                message = 123;
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('array')
            });

            it('invalid2', () => {
                message = 'asdf';
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('array')
            });


            it('valid', () => {
                message = ['asdf'];
                errors = schema.validate(message);
                expect(errors).to.have.lengthOf(0)
            });

        });

        describe('array of numbers', () => {

            beforeEach(() => {
                schema = new Schema({
                    type: 'number',
                    array: true,
                });
            })

            it('invalid1', () => {
                message = 'asdf';
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('array')
            });

            it('invalid2', () => {
                message = 123;
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('array')
            });


            it('valid', () => {
                message = [1, 2, 3];
                errors = schema.validate(message);
                expect(errors).to.have.lengthOf(0)
            });

        });

        describe('array of booleans', () => {

            beforeEach(() => {
                schema = new Schema({
                    type: 'boolean',
                    array: true,
                });
            })

            it('invalid1', () => {
                message = 123;
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('array')
            });

            it('invalid2', () => {
                message = true;
                errors = schema.validate(message);
                expect(errors.length).to.be.greaterThan(0)
                expect(errors[0]).to.contain('array')
            });


            it('valid', () => {
                message = [true];
                errors = schema.validate(message);
                expect(errors).to.have.lengthOf(0)
            });

        });

        describe('complex messages', () => {
            describe("1", () => {

                beforeEach(() => {
                    schema = new Schema({
                        properties: {
                            name: new Schema({
                                type: 'string',
                                required: true,
                            }),
                            age: new Schema({
                                type: 'number',
                                validation: (val) => val >= 0,
                            })
                        }
                    });
                })


                it('valid', () => {
                    message = {
                        name: 'Jon',
                        age: 22,
                    };

                    errors = schema.validate(message)
                    expect(errors).to.have.lengthOf(0)
                })

                it('invalid1', () => {
                    message = {
                        name: 'Jon',
                        age: 'asdf',
                    };

                    errors = schema.validate(message)
                    expect(errors.length).to.be.greaterThan(0)
                    expect(errors[0]).to.contain('number')
                })

                it('invalid2', () => {
                    message = {
                        age: 22,
                    };

                    errors = schema.validate(message)
                    expect(errors.length).to.be.greaterThan(0)
                    expect(errors[0]).to.contain('required')
                })

                it('invalid3', () => {
                    message = {
                        name: 'Jon',
                        age: -11,
                    };

                    errors = schema.validate(message)
                    expect(errors.length).to.be.greaterThan(0)
                })

            })
        })



    });

});
