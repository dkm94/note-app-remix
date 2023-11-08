import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    }; // get fake user credentials

    cy.then(() => ({ email: loginForm.email, admin: true })).as("user"); // save the user to the cypress context

    cy.visitAndCheck("/"); // go to the url and check pathname

    cy.findByRole("link", { name: /sign up/i }).click(); // click the sign up link
    cy.location("pathname").should("equal", "/join"); // check that we are on the signup page

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email); // type the email into the email field
    cy.findByLabelText(/password/i).type(loginForm.password); // type the password into the password field
    cy.findByRole("button", { name: /create account/i }).click(); // click the create account button

    cy.findByRole("link", { name: /notes/i }).click(); // click the notes link
    cy.findByRole("button", { name: /logout/i }).click(); // click the logout button
    cy.findByRole("link", { name: /log in/i }); // check that we are on the login page
  });

  it("should allow you to make a note", () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    }; // get fake note content
    cy.login(); // login as a user

    cy.visitAndCheck("/"); // go to the url and check pathname

    cy.findByRole("link", { name: /notes/i }).click(); // click the notes link
    cy.findByText("No notes yet"); // check that there are no notes

    cy.findByRole("link", { name: /\+ new note/i }).click(); // click the new note link

    cy.findByRole("textbox", { name: /title/i }).type(testNote.title); // type the title into the title field
    cy.findByRole("textbox", { name: /body/i }).type(testNote.body); // type the body into the body field
    cy.findByRole("button", { name: /save/i }).click(); // click the save button

    cy.findByRole("button", { name: /delete/i }).click(); // click the delete button

    cy.findByText("No notes yet"); // check that there are no notes
  });
});
