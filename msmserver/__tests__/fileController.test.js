import { makeRequest, getRequest, handleResponse } from '../apiHelperFunctions.js';
import File from '../models/file.js';
import createApp from '../app';

const app = createApp;

describe('Test /api/file', () => {  
    const fileEndpoint = '/api/file';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /list', () => {
        const getListEndpoint = `${fileEndpoint}/list`;
    
        it('should return list successfully', async () => {
            const mockFileList = [
                { _id: 'fileId1', identifier: 'ident', name: 'file1.txt', contentType: 'text/plain', fileID: 'fileId1' },
                { _id: 'fileId2', identifier: 'ident', name: 'file2.txt', contentType: 'text/plain', fileID: 'fileId2' },
              ];
              jest.spyOn(File, 'find').mockResolvedValueOnce(mockFileList);
          
            const request = await getRequest(app, getListEndpoint, { identifier: 'ident' });
            await handleResponse(request, 200, mockFileList);
            });
    
        it('should handle internal server error', async () => {
            jest.spyOn(File, 'find').mockRejectedValueOnce(new Error('Internal server error'));
        
            const request = await getRequest(app, getListEndpoint, { identifier: 'ident' });
            await handleResponse(request, 500, { errors: 'Internal server error' });
          });
        });
});