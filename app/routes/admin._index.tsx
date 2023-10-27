import type { Note, Prisma } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { deleteAllNotes, getAllUsersNotes } from "~/models/note.server";

export const loader = async () => {
    const noteListItems: Partial<Note>[] = await getAllUsersNotes();
    return json({ noteListItems });
  };

export const action = async () => {
    const deletedNotes: Prisma.BatchPayload = await deleteAllNotes();
    if(deletedNotes?.count === 0) {
        return json({ message: "Failed to delete resource(s)" }, { status: 400 });
    }
  
    return redirect("/notes");
  };

export default function AdminIndexPage() {
  const { noteListItems } = useLoaderData<typeof loader>();

    return (
        <Form method="post">
            <button
            type="submit"
            className={noteListItems?.length === 0 ? "rounded bg-neutral-200 hover:bg-neutral-200 px-4 py-2 text-white " : "rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"}
            disabled={noteListItems?.length === 0}
            >
            Delete all notes
            </button>
        </Form>
    );
  }