import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Note, User } from "@prisma/client";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteNote, getNote } from "~/models/note.server";
import { requireUser } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user: User = await requireUser(request);
  invariant(params.noteId, "noteId not found");

  const note: Partial<Note> | null = await getNote({ id: params.noteId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  if(note && note.userId !== user.id && !user.admin) {
    throw new Response("Unauthorized", { status: 401 });
  }
  if(note && note.userId !== user.id && user.admin === true) {
    throw new Response("Resource moved", { status: 200 });
  }
  return json({ note });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);
  
  if(_action === "delete") {
    const user = await requireUser(request);

    if(user?.id !== values.userId && !user.admin) {
      return json({ message: "Unauthorized" }, { status: 401 });
    }

    await deleteNote({
      id: values.noteId
    });

    return redirect("/notes");
  }

  if(_action === "edit") {
    return redirect(`/notes/${values.noteId}/edit`);
  }
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data?.note?.title}</h3>
      <p className="py-6">{data?.note?.body}</p>
      
      <hr className="my-4" />
      <Form method="post">
        <input type="hidden" name="noteId" value={data?.note?.id} />
        <button
          type="submit"
          name="_action"
          value="delete"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>

      <Form method="post">
        <input type="hidden" name="noteId" value={data?.note?.id} />
        <button
            type="submit"
            name="_action"
            value="edit"
            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 focus:bg-yellow-400"
        >
            Edit
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  if (error.status === 401) {
    return <div>Resource unauthorized</div>;
  }

  if (error.status === 200) {
    return <div>Please go to <Link to="/admin">/admin</Link> page to edit other users' notes</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
