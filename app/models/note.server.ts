import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";

export function getNote({
  id,
}: Pick<Note, "id">) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true, userId: true },
    where: { id },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true, body: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getAllUsersNotes() {
  return prisma.note.findMany({
    select: { id: true, title: true, user: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id
}: Pick<Note, "id">) {
  return prisma.note.delete({
    where: { id },
  });
}

export function deleteAllNotes(){
  return prisma.note.deleteMany();
}

export function deleteUserNotes({ userId }: { userId: User["id"] }){
  return prisma.note.deleteMany({
    where: { userId }
  });
}

export function updateNote({
  id,
  userId,
  body,
  title,
}: Pick<Note, "id" | "body" | "title"> & { userId: User["id"] }) {
  return prisma.note.updateMany({
    where: { id, userId },
    data: { body, title },
  });
}