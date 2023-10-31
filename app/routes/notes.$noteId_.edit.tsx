import { useState } from "react";
import type { Note, Prisma } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getNote, updateNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.noteId, "noteId not found");
  
    const note: Partial<Note> | null = await getNote({ id: params.noteId });
    if (!note) {
      throw new Response("Not Found", { status: 404 });
    }
    return json({ note });
  };
  
  export const action = async ({ request, params }: ActionFunctionArgs) => {
    const formData: FormData = await request.formData();
    const entries = Array.from(formData.entries());
    let { _action, ...values } = Object.fromEntries(entries);

    if(_action === "cancel") {
      return redirect(`/notes/${values.noteId}`);
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
  
      const res: Prisma.BatchPayload = await updateNote({
        id: values.noteId.toString(),
        userId,
        title: values.title.toString().trim(),
        body: values.body.toString().trim()
      });

      if(res.count === 0) {
        return json({ message: "Failed to update resource(s)" }, { status: 400 });
      }
  
      return redirect(`/notes/${values.noteId}`);
    }
  };

export default function NoteEditPage() {
  const data = useLoaderData<typeof loader>();

  const [title, setTitle] = useState<string>(data.note.title);
  const [body, setBody] = useState<string>(data.note.body);

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
  }

    return (
        <div>
          <div className="flex flex-row">
            <Form method="put">
              <input type="hidden" name="noteId" value={data.note.id} />
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
              <input type="hidden" name="noteId" value={data.note.id} />
              <button 
              type="submit" 
              name="_action" 
              value="cancel" 
              onClick={handleCancel} 
              className="rounded bg-slate-400 px-4 py-2 text-white hover:bg-slate-500 focus:bg-slate-300">Cancel</button>
            </Form>
          </div>
        </div>
    )
}