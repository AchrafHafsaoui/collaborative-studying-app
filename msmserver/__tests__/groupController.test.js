import createApp from '../app';
import Group from '../models/group';
import { makeRequest, getRequest, handleResponse } from '../apiHelperFunctions.js';

const app = createApp;

describe('Test /api/group', () => {  
  const groupEndpoint = '/api/group';

  beforeEach(() => {
      jest.clearAllMocks();
    });

    const userEmail = 'test@mail.com';
    const mockGroups = [
      {
        identifier: 'group1',
        groupname: 'Group 1',
        subject: 'Math',
        users: [{ email: userEmail }],
        averageRating: 4,
        pending: [],
        ratings: [5, 4, 3],
        meetings: ['Meeting 1', 'Meeting 2'],
      },
    ];

    describe('GET /getGroups', () => {
      const getGroupsEndpoint = `${groupEndpoint}/getGroups`;

      it('should return groups succesfully', async () => {
        jest.spyOn(Group, 'find').mockResolvedValueOnce(mockGroups);

        const request = getRequest(app, getGroupsEndpoint, { email: userEmail });
        await handleResponse(request, 200, mockGroups);
      });

        it('should get details of a specific group with an identifier', async () => {
            const groupIdentifier = 'group1';
            const mockGroupTest2 = {
                identifier: groupIdentifier,
                groupname: 'Group 1',
                subject: 'ComputerScience',
                users: [{ email: 'user1@test.com' }, { email: 'user2@test.com' }],
                averageRating: 4,
                pending: [],
                ratings: [5, 4, 3],
                meetings: ['Meeting 1', 'Meeting 2'],
        };
    
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce(mockGroupTest2);
    
        const request = getRequest(app, getGroupsEndpoint, { identifier: groupIdentifier });
        await handleResponse(request, 200, mockGroupTest2);
      });

      it('should handle error if group with the given identifier is not found', async () => {
        jest.spyOn(Group, 'findOne').mockResolvedValueOnce(null);
    
        const request = getRequest(app, getGroupsEndpoint, { identifier: 'nonexistentgroup' });
        await handleResponse(request, 404, { error: 'Group not found' });
      });

      it('should handle error if neither email or identifier are provided', async () => {
        const request = getRequest(app, getGroupsEndpoint);
        await handleResponse(request, 400, {
          error: "Invalid request. Provide either 'email' or 'identifier' as a query parameter.",
        });
      });
   });

    describe('GET /creategroup', () => {
      const createGroupEndpoint = `${groupEndpoint}/creategroup`;

      it('should get creategroup successfully', async () => {
        const mockResponse = [
          { identifier: 'group1', groupname: 'Group 1', users: [{ email: 'user1@example.com' }] },
          { identifier: 'group2', groupname: 'Group 2', users: [{ email: 'user2@example.com' }] },
        ];
        jest.spyOn(Group, 'find').mockResolvedValue(mockResponse);
  
        const request = getRequest(app, createGroupEndpoint);
        await handleResponse(request, 200, mockResponse);
      });

      it('should handle member details not found', async () => {
        jest.spyOn(Group, 'find').mockResolvedValueOnce([]);
  
        const request = getRequest(app, createGroupEndpoint);
        await handleResponse(request, 404, { errors: 'Member details not found' });
      });

      it('should handle internal server error', async () => {
        jest.spyOn(Group, 'find').mockRejectedValue(new Error('Simulated error'));
  
        const request = getRequest(app, createGroupEndpoint);
        await handleResponse(request, 500, { errors: 'Internal server error' });
      });
    });

     describe('/addRating', () => {
        const addRatingEndpoint = `${groupEndpoint}/addRating`;

          it('should handle group not found', async () => {
            jest.spyOn(Group, 'findOne').mockResolvedValueOnce(null);
        
            const request = getRequest(app, addRatingEndpoint, {
              groupIdentifier: 'invalidIdentifier',
              userEmail: 'user@test.com',
              rating: 4,
              review: 'Good group',
            });            
            await handleResponse(request, 404, {});
          });
     });
  });