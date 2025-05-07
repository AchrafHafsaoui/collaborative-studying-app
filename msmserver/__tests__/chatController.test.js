import createApp from '../app';
import Chat from '../models/chat.js';
import { makeRequest, handleResponse } from '../apiHelperFunctions.js';

const app = createApp;

describe('Test /api/chat', () => {
    const chatEndpoint = '/api/chat';
  
    beforeEach(() => {
        jest.clearAllMocks();
    });

  describe('POST /history', () => {
    const historyEndpoint = `${chatEndpoint}/history`;

    it('should get chat history successfully', async () => {
      const mockChat = {
        identifier: 'mockIdentifier',
        messages: ['ChatMessage1', 'ChatMessage2'],
      };

      jest.spyOn(Chat, 'findOne').mockResolvedValueOnce(mockChat);

      const request = makeRequest(app, historyEndpoint, 'post', {
        identifier: mockChat.mockIdentifier,
      });

      await handleResponse(request, 200, mockChat.messages);
    });

    it('should handle chat not found', async () => {
      jest.spyOn(Chat, 'findOne').mockResolvedValueOnce(null);

      const request = makeRequest(app, historyEndpoint, 'post', {
        identifier: 'nonExistentIdentifier',
      });

      await handleResponse(request, 404, { errors: 'Chat not found' });
    });

    it('should handle internal server error', async () => {
      jest.spyOn(Chat, 'findOne').mockRejectedValueOnce(new Error('Internal server error'));

      const request = makeRequest(app, historyEndpoint, 'post', {
        identifier: 'mockIdentifier',
      });

      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });
});