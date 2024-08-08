// /* eslint-disable */

// import { expect } from 'chai';
// import sinon from 'sinon';
// import userController from '../../controllers/userController.js';

// describe('userControllers', () => {
//     describe('#register()', ()=> {
//         it('should register a user', async () )
//     });
// });

// registerUser.test.js
import { expect } from 'chai';
import sinon from 'sinon';
import { registerUser } from '../../controllers/userController.js' // Update path as needed
import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
// import redisClient from '../utils/redis.js';

describe('registerUser', () => {
  let req, res, findOneStub, createStub, hashStub, signStub, saveStub;

  beforeEach(() => {
    // Create mock objects
    req = {
      body: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      }
    };

    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      cookie: sinon.stub().returnsThis()
    };

    // Stub methods
    findOneStub = sinon.stub(User, 'findOne');
    createStub = sinon.stub(User, 'create');
    hashStub = sinon.stub(bcrypt, 'hash');
    signStub = sinon.stub(jsonwebtoken, 'sign');
    saveStub = sinon.stub().resolves();
  });

  afterEach(() => {
    // Restore original methods
    sinon.restore();
  });

  it('should register a user successfully', async () => {
    findOneStub.resolves(null); // No existing user
    hashStub.resolves('encrypted_password');
    createStub.resolves({ id: 1, ...req.body, token: 'token', save: saveStub });
    signStub.returns('jwt_token');

    await registerUser(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWithMatch({ ...req.body, password: undefined, token: 'jwt_token' })).to.be.true;
    expect(res.cookie.calledOnce).to.be.true;
  });

  it('should return error if any field is missing', async () => {
    req.body = { ...req.body, password: '' };

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.calledWith('All fields are compulsory')).to.be.true;
  });

  it('should return error if email format is invalid', async () => {
    req.body.email = 'invalid-email';

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.calledWith('Invalid email format. Example of valid format: user@example.com')).to.be.true;
  });

  it('should return error if password is too short', async () => {
    req.body.password = '123';

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.calledWith('Password should be at least 4 characters long')).to.be.true;
  });

  it('should return error if user already exists', async () => {
    findOneStub.resolves({}); // User exists

    await registerUser(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.send.calledWith('User already exist with this email')).to.be.true;
  });

//   it('should return error if password encryption fails', async () => {
//     findOneStub.resolves(null); // No existing user
//     hashStub.rejects(new Error('Encryption failed'));

//     await registerUser(req, res);

//     expect(res.status.calledWith(500)).to.be.true;
//     expect(res.send.calledWith('Could not encrypt password')).to.be.true;
//   });

  it('should handle internal errors', async () => {
    findOneStub.resolves(null); // No existing user
    hashStub.resolves('encrypted_password');
    createStub.rejects(new Error('Database error'));

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: 'Database error' })).to.be.true;
  });
});
