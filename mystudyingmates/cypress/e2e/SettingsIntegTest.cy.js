import { deleteAccountRoute } from "../../utils/apiRoutes";

describe('Settings Cypress Testing', () => {
    // Further tests can be found in __tests__ under Menu.test.js
    // Set the initialRoute in apps to Settings / the individual screens
    describe('Settings Screen Testing', () => {
        it('should connect to the settings site', () => {
            cy.visit('http://localhost:19006/');
        });

        it('should display the login settings correctly', () => {
            cy.visit('http://localhost:19006/');

            // Renders Account Settings paragraph
            cy.contains('Account Settings');
            cy.contains('Personal Information');
            cy.contains('Email');
            cy.contains('Theme');

            // Renders Notification Settings paragraph
            cy.contains('Notification Settings');
            cy.contains('Push Notifications');
            cy.contains('Email Notifications');

            // Renders Privacy Settings
            cy.contains('Privacy Settings');
            cy.contains('Password');
        
            // Renders Support Settings
            cy.contains('Support Settings');
            cy.contains('Delete account');

            // Renders Logout Button
            cy.contains('Logout');
        });

        it('should return error if account does not exist for deletion', () => {
            const deleteAccountBody = {
                "userId": "testId"
            }
            cy.request({
                method: 'DELETE',
                url: deleteAccountRoute,
                body: deleteAccountBody,
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.status).to.equal(404);
                expect(response.body).to.have.property('errors', 'User not found');
            });
        });

        it('should delete the user account', () => {
            const deleteAccountBody = {
                "userId": "6582e505750c2d5cd26251fb"
            }
            cy.request({
                method: 'DELETE',
                url: deleteAccountRoute,
                body: deleteAccountBody,
              }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('message', 'Account deleted successfully');
            });
        });
    });
});