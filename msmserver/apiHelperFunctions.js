import supertest from 'supertest';

// Helper function to make requests
export async function makeRequest(app, endpoint, method, data = {}) {
    const request = supertest(app)[method](endpoint);
  
    if (method === 'post' || method === 'put' || method === 'patch') {
      request.send(data);
    }

    if (method === 'delete') {
      request.send(data);
    }
  
    return request;
}

// Helper function to get requests
export async function getRequest(app, endpoint, query = {}) {
    const request = supertest(app).get(endpoint);
  
    if (Object.keys(query).length > 0) {
      request.query(query);
    }
  
    return request;
  };

// Helper function to handle responses and assertions
export async function handleResponse(request, expectedStatusCode, expectedBody) {
  const { statusCode, body } = await request;
  expect(statusCode).toBe(expectedStatusCode);
  expect(body).toEqual(expectedBody);
};
