import { loginRoute } from "../../utils/apiRoutes";

describe('Login Cypress Testing', () => {
    // Further testing can be found in __tests__

    it('should connect to the site', () => {
        cy.visit('http://localhost:19006/');
    });

    it('should display the login screen correctly', () => {
        cy.visit('http://localhost:19006/');

        cy.contains('Login or Signup');
        cy.get('img');
        cy.contains('Continue');
        cy.contains('Sign Up');
    });

    describe('Test API calls', () => {
        it('should login API call with existing user', () => {
            const testValidUserData = {
                email: 'integ@test.com',
                password: 'integPassword'
            };

            const userMongoDBObject = {
                "_id":  "65bba06a8f16ce4a707d9aaa",
                "name": "Integ",
                "surname": "Test",
                "university": "TU Darmstadt",
                "email": "integ@test.com",
                "verified": true,
                "password": "$2a$10$eKJjevwXMywTQwSste9tle6g.a8X50TcKFXnCkSZywRNYbPrRegaa",
              }
            cy.request({
                method: 'POST',
                url: loginRoute,
                body: testValidUserData,
              }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body._id).to.equal(userMongoDBObject._id);
                expect(response.body.name).to.equal(userMongoDBObject.name);
                expect(response.body.surname).to.equal(userMongoDBObject.surname);
                expect(response.body.university).to.equal(userMongoDBObject.university);
                expect(response.body.email).to.equal(userMongoDBObject.email);
                expect(response.body.verified).to.equal(userMongoDBObject.verified);
                expect(response.body.password).to.equal(userMongoDBObject.password);
            });
        });

        it('should return error when login API call with existing user without email verification', () => {
            const testUnverifiedUserData = {
                email: 'integ@unverified.com',
                password: 'unverifiedUser'
            };

            cy.request({
                method: 'POST',
                url: loginRoute,
                body: testUnverifiedUserData,
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.status).to.equal(401); 
                expect(response.body).to.have.property('errors', 'Email not verified. Please check your email for verification instructions.');
            });
        });
        
        it('should return error when login API call with invalid user', () => {
            const testInvalidUserData = {
              email: 'nonExisting@mail.com',
              password: 'randomPassword',
            };
     
            cy.request({
              method: 'POST',
              url: loginRoute,
              body: testInvalidUserData,
              failOnStatusCode: false, 
            }).then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body).to.have.property('errors', 'No user found');
            });
        });
    });
});