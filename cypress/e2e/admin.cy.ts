import { faker } from "@faker-js/faker";

describe(('admin tests'), () => {

      it("should allow user to see the admin page", () => {
        const loginForm = {
          email: `candidat@may.fr`,
          password: "flexiblebenefits",
        };

        cy.visitAndCheck("/"); 

        cy.findByRole("link", { name: /log in/i }).click(); 
        cy.location("pathname").should("equal", "/login");

        cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
        cy.findByLabelText(/password/i).type(loginForm.password);
        cy.findByRole("button", { name: /log in/i }).click();

        cy.findByRole("link", { name: /notes/i }).click();

        cy.findByRole("link", { name: /admin view/i }).click();
        cy.location("pathname").should("equal", "/admin");

      });

      it("should allow admin to delete all notes", () => {
        const testNote = {
          title: faker.lorem.words(1),
          body: faker.lorem.sentences(1),
        };
        
        cy.loginAsAdmin();
        cy.visitAndCheck("/"); // go to the url and check pathname

        cy.findByRole("link", { name: /notes/i }).click(); // click the notes link

        cy.findByRole("link", { name: /\+ new note/i }).click(); // click the new note link
        cy.findByRole("textbox", { name: /title/i }).type(testNote.title); // type the title into the title field
        cy.findByRole("textbox", { name: /body/i }).type(testNote.body); // type the body into the body field
        cy.findByRole("button", { name: /save/i }).click();
        
        cy.findByRole("link", { name: /notes/i }).wait(2000)

        cy.findByRole("link", { name: /admin view/i }).click();

        cy.findByRole("button", { name: /delete all notes/i }).should('be.enabled');
        cy.findByRole("button", { name: /delete all notes/i }).click();

        cy.location("pathname").should("equal", "/notes");
      });

      it("should allow admin to delete a note from another user", () => {

      })

      it("should allow admin to delete all notes from another user", () => {
        
      })
});