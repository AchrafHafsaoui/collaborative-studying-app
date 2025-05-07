import createApp from '../app';
import Whiteboard from '../models/whiteboard';
import { makeRequest, handleResponse } from '../apiHelperFunctions';

const app = createApp;

describe('Test /api/whiteboard', () => {  
  const whiteboardEndpoint = '/api/whiteboard';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /paths', () => {
    const getPathsEndpoint = `${whiteboardEndpoint}/paths`;

    it('should return paths successfully', async () => {
      const mockPaths = ['path1', 'path2'];
      jest.spyOn(Whiteboard, 'findOne').mockResolvedValueOnce({ paths: mockPaths });

      const request = makeRequest(app, getPathsEndpoint, 'post', { identifier: 'testIdentifier' });
      await handleResponse(request, 200, mockPaths);
    });

    it('should handle Whiteboard not found', async () => {
      jest.spyOn(Whiteboard, 'findOne').mockResolvedValueOnce(null);

      const request = makeRequest(app, getPathsEndpoint, 'post', { identifier: 'testIdentifier' });
      await handleResponse(request, 404, { errors: 'Whiteboard not found' });
    });

    it('should handle internal error', async () => {
      jest.spyOn(Whiteboard, 'findOne').mockRejectedValueOnce(new Error('Internal server error'));

      const request = makeRequest(app, getPathsEndpoint, 'post', { identifier: 'testIdentifier' });
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });
  });

  describe('POST /createWhiteboard', () => {
    const createWhiteboardEndpoint = `${whiteboardEndpoint}/createWhiteboard`;

    it('should handle missing identifier', async () => {
      const request = makeRequest(app, createWhiteboardEndpoint, 'post', {});
      await handleResponse(request, 404, {});
    });
  });

  describe('POST /bubbles', () => {
    const bubblesEndpoint = `${whiteboardEndpoint}/bubbles`;
    const mockIdentifier = 'mockIdentifier';

    it('should get bubbles successfully', async () => {
      const mockBubbles = ['bubble1', 'bubble2'];
      jest.spyOn(Whiteboard, 'findOne').mockResolvedValueOnce({ identifier: mockIdentifier, bubbles: mockBubbles });

      const request = makeRequest(app, bubblesEndpoint, 'post', { identifier: mockIdentifier });
      await handleResponse(request, 200, mockBubbles);
    });

    it('should handle internal server error', async () => {
      jest.spyOn(Whiteboard, 'findOne').mockRejectedValueOnce(new Error('Mocked error during whiteboard lookup'));

      const request = makeRequest(app, bubblesEndpoint, 'post', { identifier: mockIdentifier });
      await handleResponse(request, 500, { errors: 'Internal server error' });
    });

    it('should handle Whiteboard not found', async () => {
      jest.spyOn(Whiteboard, 'findOne').mockResolvedValueOnce(null);

      const request = makeRequest(app, bubblesEndpoint, 'post', { identifier: mockIdentifier });
      await handleResponse(request, 404, { errors: 'Whiteboard not found' });
    });
  });
});