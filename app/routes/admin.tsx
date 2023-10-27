import { Form, Link, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { redirect, type LoaderFunctionArgs, json } from '@remix-run/node';

import { getUser } from '~/session.server';
import { getAllUsers } from '~/models/user.server';
import { useUser } from '~/utils';
import logo from "public/logo.svg";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user?.admin) return redirect("/notes");

  const users = await getAllUsers();
  if(!users) {
    return json({ message: "Failed to fetch resource(s)" }, { status: 400 });
  }
  return json({ users });
}

export default function Admin() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-[color:rgba(221,246,254,1)] p-4 text-white">
        <div className="flex flex-row gap-3 self-center">
          <img src={logo} alt="Remix Logo" className="w-8 h-8" />
          <h1 className="text-3xl font-bold">
            <Link to="/notes">Notes</Link>
          </h1>
        </div>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          {data.users?.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.users.map((user) => (
                <li key={user.id}>
                  <NavLink
                    className="block border-b p-4"
                    to={user.id}
                  >
                    {user.email}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
};