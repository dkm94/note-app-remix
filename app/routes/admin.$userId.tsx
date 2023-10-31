import type { Note, Prisma, User } from "@prisma/client";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";

import { deleteNote, getNoteListItems, deleteUserNotes, updateNote } from "~/models/note.server";
import { requireUser, requireUserId } from "~/session.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.userId, "userId not found");

    const notes: Partial<Note>[] = await getNoteListItems({ userId: params.userId });
    if (!notes) {
      throw new Response("Not Found", { status: 404 });
    }
    return json({ notes });
  };

export const action = async ({ params, request }: LoaderFunctionArgs) => {
  const formData: FormData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  if(_action === "deleteAll") {
    const res: Prisma.BatchPayload = await deleteUserNotes({
      userId: params.userId
    });

    if(res.count === 0) {
      return json({ message: "Failed to delete resource(s)" }, { status: 400 });
    }
    return redirect(`/admin/${params.userId}`);
  }

  if(_action === "delete") {
    const user: User = await requireUser(request);

    if(user?.id !== values.userId && !user.admin) {
      return json({ message: "Unauthorized" }, { status: 401 });
    }

    await deleteNote({
      id: values.noteId.toString()
    });

    return redirect(`/admin/${values.userId}`);
  }

  if(_action === "cancel") {
    return redirect(`/admin/${params.userId}`);
  }

  if(_action === "save") {
    const userId: string = await requireUserId(request);
    invariant(values.noteId, "noteId not found");

    if (typeof values.title !== "string" || values.title.length === 0) {
      return json(
        { errors: { body: null, title: "Title is required" } },
        { status: 400 },
      );
    }

    if (typeof values.body !== "string" || values.body.length === 0) {
      return json(
        { errors: { body: "Body is required", title: null } },
        { status: 400 },
      );
    }

    const res: Prisma.BatchPayload  = await updateNote({
      id: values.noteId.toString(),
      userId,
      title: values.title.trim(),
      body: values.body.trim()
    });

    if(res.count === 0) {
      return json({ message: "Failed to update resource(s)" }, { status: 400 });
    }

    return redirect(`/admin/${userId}`);
  }
};

export default function UserNotesFromAdminPage() {
  const user = useLoaderData<typeof loader>();

  const [noteId, setNoteId] = useState<string>(user?.note?.id);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");

  useEffect(() => {
    setNoteId("")
  }, [user]);

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>):void => {
    if(e.target.name === "title") {
      setTitle(e.target.value);
    } else if(e.target.name === "body") {
      setBody(e.target.value);
    } else {
      throw new Error("Invalid input name");
    }
  }

  const handleCancel = ():void => {
    setTitle("");
    setBody("");
    setNoteId("");
  }

  const handleEditNote = (noteId: string) => ():void => {
    setNoteId(noteId);
    if(noteId){
      const selectedNote: Note = user.notes?.find((note) => note.id === noteId);
      setTitle(selectedNote?.title);
      setBody(selectedNote?.body);
    }
  }

    return (
      <div>
        {user.notes?.length === 0 && <p>No notes found</p>}
        {user.notes.map((note) => (
                <div key={note.id}>
                  <li className="list-none flex flex-col">
                    {noteId === note.id ? (
                      <div className="flex flex-row">
                      <Form method="put">
                        <input type="hidden" name="noteId" value={note.id} />
                        <input name="title" value={title} onChange={handleChanges} />
                        <input name="body" value={body} onChange={handleChanges} />
                        <button
                            type="submit"
                            name="_action"
                            value="save"
                            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:bg-green-400"
                        >
                          Save
                        </button>
                      </Form>
                      <Form method="post">
                        <input type="hidden" name="noteId" value={note.id} />
                        <button 
                        type="submit" 
                        name="_action" 
                        value="cancel" 
                        onClick={handleCancel} 
                        className="rounded bg-slate-400 px-4 py-2 text-white hover:bg-slate-500 focus:bg-slate-300">Cancel</button>
                      </Form>
                    </div>
                    ) : <p>📝 {note.title}</p>}
                    {noteId? "" : <p>{note.body}</p>}
                  </li>
                  {!noteId && <div className="flex flex-row">
                    <Form method="post">
                      <input type="hidden" name="noteId" value={note?.id} />
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
                      <input type="hidden" name="noteId" value={user?.note?.id} />
                      <button
                          type="button"
                          name="_action"
                          value="edit"
                          onClick={handleEditNote(note.id)}
                          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 focus:bg-yellow-400"
                      >
                          Edit
                      </button>
                    </Form>
                  </div>}
                </div>
              ))}
        <hr className="my-4" />
        <Form method="post">
            <button
            type="submit"
            name="_action"
            value="deleteAll"
            className={user.notes?.length === 0 ? "rounded bg-neutral-200 hover:bg-neutral-200 px-4 py-2 text-white " : "rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"}
            disabled={user.notes?.length === 0}
            >
            Delete all user notes
            </button>
        </Form>
      </div>
    );
  }