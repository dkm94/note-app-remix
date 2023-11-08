// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/login-user.ts candidat@may.fr
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { installGlobals } from "@remix-run/node";
import { parse } from "cookie";

import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import * as readline from "readline";

installGlobals();

async function login(credentials: string) {
  const splitValues = credentials.split(' ');
  console.log("🚀 ~ file: login-user.ts:18 ~ login ~ splitValues:", splitValues)
  const email = splitValues[1];
  // console.log("🚀 ~ file: login-user.ts:19 ~ login ~ email:", email)
  const password = splitValues[0];
  // console.log("🚀 ~ file: login-user.ts:21 ~ login ~ password:", password)
  if (!email) {
    throw new Error("email required for login");
  }

  const user = await verifyLogin(email, password);
  // console.log("🚀 ~ file: login-user.ts:22 ~ login ~ verifyLogin:", user)

    const response = user && await createUserSession({
        request: new Request("test://test"),
        userId: user?.id,
        remember: false,
        redirectTo: "/",
        });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim(),
  );
}

login(process.argv[2]);
// const [email, password] = process.argv[2].split(':');
// login(email, password);
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// rl.question("Enter your password: ", async (password) => {
//     await login(process.argv[2], password);
//     rl.close();
// });
