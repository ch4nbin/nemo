"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentsState {
  documents: Document[];
  createDocument: () => string;
  updateDocument: (id: string, updates: Partial<Omit<Document, "id" | "createdAt">>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
}

export const useDocuments = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],
      createDocument: () => {
        const id = crypto.randomUUID();
        const now = new Date();
        const newDoc: Document = {
          id,
          title: "Untitled",
          content: "",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          documents: [newDoc, ...state.documents],
        }));
        return id;
      },
      updateDocument: (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? { ...doc, ...updates, updatedAt: new Date() }
              : doc
          ),
        }));
      },
      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },
      getDocument: (id) => {
        return get().documents.find((doc) => doc.id === id);
      },
    }),
    {
      name: "docs-storage",
    }
  )
);
