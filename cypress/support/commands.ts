import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Logs as admin.
       *
       * @returns {typeof loginAsAdmin}
       * @memberof Chainable
       * @example
       *    cy.loginAsAdmin()
       */
      loginAsAdmin: typeof loginAsAdmin;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login({
  email = faker.internet.email(undefined, undefined, "example.com"), // get a fake email
}: { // define the login function
  email?: string; // optional email
} = {}) {
  cy.then(() => ({ email })).as("user"); // save the user to the cypress context
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${email}"`,
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();
    cy.setCookie("__session", cookieValue);
  }); // create a user and set the cookie
  return cy.get("@user"); // return the user
}

function loginAsAdmin({
  email = "candidat@may.fr",
  password = "flexiblebenefits",
}: { // define the login function
  email?: string; // optional email
  password?: string; // optional password
} = {}) {
  cy.then(() => ({ email, password })).as("user"); // save the user to the cypress context
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/login-user.ts "${password} ${email}"`,
  )
  .then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();
    cy.setCookie("__session", cookieValue);
  }); // create a user and set the cookie
  return cy.get("@user"); // return the user
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session"); // clear the cookie
}

function deleteUserByEmail(email: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${email}"`,
  );
  cy.clearCookie("__session");
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1000) {
  cy.visit(url); // visit the url
  cy.location("pathname").should("contain", url).wait(waitTime); // wait for the page to load
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("loginAsAdmin", loginAsAdmin);
Cypress.Commands.add("cleanupUser", cleanupUser);
Cypress.Commands.add("visitAndCheck", visitAndCheck);
