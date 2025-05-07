import { updateEmailRoute } from "../../utils/apiRoutes";

describe('Email Screen Testing', () => {
    // Add route to Email Screen for a user
    const testingUserOriginalData = {
        "userId": "65bdf9aa61f6dcbf337ebf5c",
        "name": "Settings",
        "surname": "Integration",
        "email": "s@i.com",
    };

    it('should connect to the site', () => {
        cy.visit('http://localhost:19006/');
    });

    it('should render the Email screen', () => {
        cy.visit('http://localhost:19006/');
        cy.contains('Email');
        cy.contains('Save');
    });

    it('should update the mail', () => {
        const updateEmailBody = {
            "userId": "65bdf9aa61f6dcbf337ebf5c",
            "email": "news@i.com"
        }
        cy.request({
            method: 'PATCH',
            url: updateEmailRoute,
            body: updateEmailBody,
          }).then((response) => {
            expect(response.status).to.equal(200);
            // email should be updated
            expect(response.body.email).to.equal(updateEmailBody.email);
        })
    });

    it('should not update the email if email already existing', () => {
        const updateEmailBody = {
            "userId": "65bdf9aa61f6dcbf337ebf5c",
            "email": "integsignsp@test.com"
        }
        cy.request({
            method: 'PATCH',
            url: updateEmailRoute,
            body: updateEmailBody,
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.equal(500);
        })
    });
});