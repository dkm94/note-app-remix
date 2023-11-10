// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/login-user.ts candidat@may.fr
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { installGlobals } from "@remix-run/node";
import { parse } from "cookie";

import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/session.server";

installGlobals();

async function login(credentials: string) {
  const splitValues = credentials.split(' ');
  const email = splitValues[1];
  const password = splitValues[0];

  if (!email) {
    throw new Error("email required for login");
  }

  const user = await verifyLogin(email, password);

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
  
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim(),
  );
}

login(process.argv[2]);