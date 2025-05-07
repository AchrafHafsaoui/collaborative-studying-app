import mongoose from 'mongoose';
import createApp from '../app';
import User from '../models/user';
import bcrypt from "bcryptjs";
import { makeRequest, handleResponse } from '../apiHelperFunctions.js';

const app = createApp;

const userId = new mongoose.Types.ObjectId().toString();

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  }));

const userInput = {
    name: "Test",
    surname: "User",
    university: "TU Darmstadt",
    email: "testUser@test.com",
    password: "testUserPassword123",
};

const userInputWithId = {
    _id: userId,
    name: 'Test',
    surname: 'User',
    university: 'TU Darmstadt',
    email: 'testUser@test.com',
    password: 'testUserPassword123',
    image: 'new-image-url',
}

describe('Test /api/auth', () => {
  const authEndpoint = '/api/auth';

  beforeEach(() => {
    jest.clearAllMocks();
  });
      
  describe('POST /getUsers', () => {
    const getUsersEndpoint = `${authEndpoint}/getUsers`;

    it('should return a list of users', async () => {
      const mockUsers = [userInput];
      jest.spyOn(User, 'find').mockResolvedValueOnce(mockUsers);

      const request = makeRequest(app, getUsersEndpoint, 'post', {});
      await handleResponse(request, 200, mockUsers);
    });

    it('should handle error', async () => {
      jest.spyOn(User, 'find').mockRejectedValueOnce(new Error('Internal server error'));

      const request = makeRequest(app, getUsersEndpoint, 'post', {});
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });
  describe('POST /checkPremium', () => {
    const checkPremiumEndpoint = `${authEndpoint}/checkPremium`;
  
    it('should check premium status successfully', async () => {
      const userWithPremium = {
        _id: userId,
        name: 'Test',
        surname: 'User',
        university: 'TU Darmstadt',
        email: 'test.user@test.com',
        password: 'testUserPassword123',
        premium: true,
      };

      jest.spyOn(User, 'findById').mockResolvedValueOnce(userWithPremium);
  
      const request = makeRequest(app, checkPremiumEndpoint, 'post', { userId });
      await handleResponse(request, 200, { isPremium: true });
    });
  
    it('should handle user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce(null);
  
      const request = makeRequest(app, checkPremiumEndpoint, 'post', { userId: 'nonExistentUserId' });
      await handleResponse(request, 404, { errors: 'User not found' });
    });
  
    it('should handle internal server error during premium check', async () => {
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Internal server error'));
  
      const request = makeRequest(app, checkPremiumEndpoint, 'post', { userId: 'someUserId' });
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });

    describe('POST /auth/register', () => {
      const registerEndpoint = `${authEndpoint}/register`;

      it('should registers a new user with valid data', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
  
        bcrypt.genSalt.mockImplementationOnce((_, callback) => callback(null, 'mocked-salt'));
        bcrypt.hash.mockImplementationOnce((_, __, callback) => callback(null, 'hashed-password'));
  
        const saveMock = jest.fn().mockResolvedValue({
          email: userInput.email,
          name: userInput.name,
          surname: userInput.surname,
          university: userInput.university,
          password: 'hashed-password',
        });
  
        jest.spyOn(User.prototype, 'save').mockImplementation(saveMock);
  
         const request = makeRequest(app, registerEndpoint, 'post', userInput);
         const { statusCode, body } = await request;
         expect(statusCode).toBe(200);
      });

      it('should handle errors during registration', async () => {
        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Error during user registration!'));
  
        const request = makeRequest(app, registerEndpoint, 'post', userInput);
        await handleResponse(request, 500, {});
      });
    });

    describe("DELETE /deleteAccount", () => {
      const deleteAccountEndpoint = `${authEndpoint}/deleteAccount`;
      
      it('should delete an account successfully', async () => {
        jest.spyOn(User, 'findByIdAndDelete').mockResolvedValueOnce(/* mocked result */);
    
        const request = makeRequest(app, deleteAccountEndpoint, 'delete', { userId });
        await handleResponse(request, 200, { message: 'Account deleted successfully' });
      });

      it('should handle not provided userId', async () => {
        const request = makeRequest(app, deleteAccountEndpoint, 'delete', {});
        await handleResponse(request, 400, { errors: 'UserId not provided' });
      });

      it('should handle user not found', async () => {
        jest.spyOn(User, 'findByIdAndDelete').mockResolvedValueOnce(null);

        const request = makeRequest(app, deleteAccountEndpoint, 'delete', { userId });
        await handleResponse(request, 404, { errors: 'User not found' });
      });

      it('should handle error', async () => {
        jest.spyOn(User, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Internal Server Error'));
    
        const request = makeRequest(app, deleteAccountEndpoint, 'delete', { userId });
        await handleResponse(request, 500, { errors: 'Internal Server Error' });
      });
  });

  describe("PATCH /updateEmail", () => {
    const updateMailEndpoint = `${authEndpoint}/updateEmail`;

    it('should update email successfully', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(userInputWithId);
  
      const request = makeRequest(app, updateMailEndpoint, 'patch', { userId, email: 'test-email@test.com' });
      await handleResponse(request, 200, userInputWithId);
    });

    it('should handle user not found', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);
  
      const request = makeRequest(app, updateMailEndpoint, 'patch', { userId: 'nonExistentUserId', email: 'test-email@test.com' });
      await handleResponse(request, 404, { errors: 'User not found' });
    });

    it('should handle internal server error', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Internal server error'));
  
      const request = makeRequest(app, updateMailEndpoint, 'patch', { userId: 'someUserId', email: 'test-email@test.com' });
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });

  describe("PATCH /updateImage", () => {
    const updateImageEndpoint = `${authEndpoint}/updateImage`;

    it('should update image successfully', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(userInputWithId);
  
      const request = makeRequest(app, updateImageEndpoint, 'patch', { userId, image: 'test-image-url' });
      await handleResponse(request, 200, userInputWithId);
    });

    it('should handle user not found', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);
  
      const request = makeRequest(app, updateImageEndpoint, 'patch', { userId: 'nonExistentUserId', image: 'test-image-url' });
      await handleResponse(request, 404, { errors: 'User not found' });
    });

    it('should handle internal server error', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Internal server error'));
  
      const request = makeRequest(app, updateImageEndpoint, 'patch', { userId: 'someUserId', image: 'test-image-url' });
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });

  describe('PATCH /updateName', () => {
    const updateNameEndpoint = `${authEndpoint}/updateName`;

    it('should update the name successfully', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(userInputWithId);
  
      const request = makeRequest(app, updateNameEndpoint, 'patch', { userId, name: 'NewName' });
      await handleResponse(request, 200, userInputWithId);
    });

    it('should handle user not found', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);
  
      const request = makeRequest(app, updateNameEndpoint, 'patch', { userId: 'nonExistentUserId', name: 'NewName' });
      await handleResponse(request, 404, { errors: 'User not found' });
    });

    it('should handle internal server error', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Internal server error'));
  
      const request = makeRequest(app, updateNameEndpoint, 'patch', { userId: 'someUserId', name: 'NewName' });
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });
});