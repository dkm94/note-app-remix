import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Note, User } from "@prisma/client";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import logo from "public/logo.svg";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId: string = await requireUserId(request);
  const noteListItems: Partial<Note>[] = await getNoteListItems({ userId });
  return json({ noteListItems });
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>(); // current user notes' list
  const user: User = useUser();
  console.log("🚀 ~ file: notes.tsx:20 ~ NotesPage ~ user:", user)

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-[color:rgba(221,246,254,1)] p-4 text-white">
        <div className="flex flex-row gap-3 self-center">
          <img src={logo} alt="Remix Logo" className="w-8 h-8" />
          <h1 className="text-3xl font-bold">
            <Link to=".">Notes</Link>
          </h1>
        </div>
        <p>{user.email}</p>
        { user?.admin === true && <Link to="/admin" className="rounded text-black bg-orange-500 px-4 py-2 hover:bg-orange-700 active:bg-orange-300">Admin view</Link>}
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
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>

          <hr />

          {data.noteListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={note.id}
                  >
                    📝 {note.title}
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
  );
}
