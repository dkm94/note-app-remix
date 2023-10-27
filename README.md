# May Tech Challenge

## Prerequisites

Make sure you have both installed

- Node 18
- Npm

After cloning this repository, at the root level of it make sure you create a `.env`

```sh
cp .env.example .env
```

Finally, install all dependencies

```sh
npm install
```

## Starting the project

- Initial setup:

  ```sh
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `candidat@may.fr`
- Password: `flexiblebenefits`

### Relevant code:

This is a pretty simple note-taking app, but it's a good example of how you can build a full stack app with Prisma and Remix. The main functionality is creating users, logging in and out, and creating and deleting notes.

- creating users, and logging in and out [./app/models/user.server.ts](./app/models/user.server.ts)
- user sessions, and verifying them [./app/session.server.ts](./app/session.server.ts)
- creating, and deleting notes [./app/models/note.server.ts](./app/models/note.server.ts)

## Tasks

### Step 0 - Looking Around

- [ ] Install the project, get comfortable with it
- [ ] Login with the account provided in this readme
- [ ] Create a new account
- [ ] Locate the logo in the file hierarchy

### Step 1 - Design

- [ ] Add the logo to the center of the login / signup page
- [ ] Add the logo in the top left corner of the Notes pages
- [ ] Change the color of the top banner of the Notes pages to match the landing page sky blue color

### Step 2 - Data Model & Route Protection

- [ ] Modify the data model to support admin user
- [ ] Modify the seed data to turn the "candidat@may.fr" into an admin user
- [ ] Add a new page accessible only to admin users under `/admin`

### Step 3 - New Feature Admin Control

- [ ] On this new page list all notes including notes from other users than yourself
- [ ] On this list, display the email associated with each note
- [ ] Make email clickable to display notes only from this user
- [ ] Add the ability to delete notes on all admin pages

### Step 4 - New Feature Edit Note

- [ ] Add an edit button on all notes, clicking edit should lead to `/notes/:noteId/edit`
- [ ] On this page user should be able to edit and save or cancel changes
- [ ] User should be able to see, edit and delete only their notes
- [ ] Admin should be able to see, edit and delete all notes

## Going Further - Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login();
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanupUser();
});
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
