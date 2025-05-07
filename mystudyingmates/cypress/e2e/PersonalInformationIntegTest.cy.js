import { updateNameRoute } from "../../utils/apiRoutes";

describe('Personal Information Screen Testing', () => {
    // Add route to PI Screen for a user
    const testingUserOriginalData = {
        "name": "Settings",
        "surname": "Integration",
    };

    it('should connect to the settings site', () => {
        cy.visit('http://localhost:19006/');
    });

    it('should render the Personal Information screen', () => {
        cy.visit('http://localhost:19006/');
        cy.contains('Personal Information');
        cy.contains('Save');
    });

    it('should update only the name', () => {
        const updateNameBody = {
            "userId": "65bdf9aa61f6dcbf337ebf5c",
            "name": "Settings1",
        }
        cy.request({
            method: 'PATCH',
            url: updateNameRoute,
            body: updateNameBody,
          }).then((response) => {
            expect(response.status).to.equal(200);
            // name should be updated
            expect(response.body.name).to.equal(updateNameBody.name);
        })
    });

    it('should update only the surname', () => {
        const updateSurnameBody = {
            "userId": "65bdf9aa61f6dcbf337ebf5c",
            "surname": "Integration1",
        }
        cy.request({
            method: 'PATCH',
            url: updateNameRoute,
            body: updateSurnameBody,
          }).then((response) => {
            expect(response.status).to.equal(200);
            // surname should be updated
            expect(response.body.surname).to.equal(updateSurnameBody.surname);
        });
    });

    it('should update both names', () => {
        const updateCompleteNameBody = {
            "userId": "65bdf9aa61f6dcbf337ebf5c",
            "name": "Settings",
            "surname": "Integration",
        }
        cy.request({
            method: 'PATCH',
            url: updateNameRoute,
            body: updateCompleteNameBody,
          }).then((response) => {
            expect(response.status).to.equal(200);
            // name and surname should be updated
            expect(response.body.name).to.equal(updateCompleteNameBody.name);
            expect(response.body.surname).to.equal(updateCompleteNameBody.surname);
        });
    });
});