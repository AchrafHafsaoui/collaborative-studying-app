import { registerRoute } from "../../utils/apiRoutes";

describe('SignUp Cypress Testing', () => {
    // Further tests can be found in __tests__
    // Set the initialRoute in apps to SignUp

    it('should connect to the site', () => {
        cy.visit('http://localhost:19006/');
    });

    it('should render the signUp screen', () => {
        cy.visit('http://localhost:19006/');

        // Renders title
        cy.get('[data-testid="appbar-content-title-text"]')
        // Renders SignUp button
        cy.get('[data-testid="button"')
    });

    describe('Test API calls', () => {
        const testValidUserData = {
            name: "integ",
            surname: "signUpTest",
            email: 'integsignsp@test.com',
            university: 'RTWH Aachen',
            password: 'integPassword',
        };

        it('should sucessfully signUp a new account', () => {
            cy.request({
                method: 'POST',
                url: registerRoute,
                body: testValidUserData,
              }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body.name).to.equal(testValidUserData.name);
                expect(response.body.surname).to.equal(testValidUserData.surname);
                expect(response.body.email).to.equal(testValidUserData.email);
                expect(response.body.university).to.equal(testValidUserData.university);
                // initally: verified should be false (needs to verify email-address)
                expect(response.body.verified).to.be.false;
            });
        });

        it('should not be able to signUp with existing email', () => {
            cy.request({
                method: 'POST',
                url: registerRoute,
                body: testValidUserData,
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.status).to.equal(400);
                expect(response.body).to.have.property('errors', 'User already exists!');
            });
        });
    });


});