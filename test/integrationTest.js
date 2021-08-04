const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../server');
const mock = require('./mock');

chai.use(chaiHttp);

describe('App', () => {
    describe('GET request', () => {
        it('should return 200 OK status', (done) => {
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('POST request for C', () => {		
        it('should return 201 and run code', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.valid.c)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text).to.equal('> Hello World!');
                    done();
                });
        });
    });

    describe('POST request for C++', () => {		
        it('should return 201 and run code', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.valid.cpp)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text).to.equal('> Hello World!');
                    done();
                });
        });
    });

    describe('POST request for Rust', () => {		
        it('should return 201 and run code', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.valid.rust)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text).to.equal('> Hello World!\n');
                    done();
                });
        });
    });

    describe('POST request for invalid C', () => {		
        it('should return 201 and compile error', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.compileErr.c)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text.startsWith('> Error')).to.be.true;
                    done();
                });
        });
    });

    describe('POST request for invalid C++', () => {		
        it('should return 201 and compile error', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.compileErr.cpp)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text.startsWith('> Error')).to.be.true;
                    done();
                });
        });
    });

    describe('POST request for invalid Rust', () => {		
        it('should return 201 and compile error', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.compileErr.rust)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text.startsWith('> Error')).to.be.true;
                    done();
                });
        });
    });

    describe('POST request for invalid C', () => {		
        it('should return 201 and runtime error', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.runtimeErr.c)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text.startsWith('> Error')).to.be.true;
                    done();
                });
        });
    });

    describe('POST request for invalid C++', () => {		
        it('should return 201 and runtime error', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.runtimeErr.cpp)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text.startsWith('> Error')).to.be.true;
                    done();
                });
        });
    });

    describe('POST request for invalid Rust', () => {		
        it('should return 201 and runtime error', (done) => {
            chai.request(server)
                .post('/')
                .send(mock.runtimeErr.rust)
                .end((err, res) => {
                    if (err) done(err);
                    expect(res).to.have.status(201);
                    expect(res.text.startsWith('> Error')).to.be.true;
                    done();
                });
        });
    });
});