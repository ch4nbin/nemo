"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDocuments, Document } from "@/lib/documents";
import { Plus, ArrowUpRight, Trash2 } from "lucide-react";

function formatDate(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).toUpperCase();
}

function DocumentRow({ doc, onDelete }: { doc: Document; onDelete: () => void }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const preview = doc.content
    ? doc.content.replace(/<[^>]*>/g, "").slice(0, 60)
    : "Empty document";

  return (
    <div
      className="group flex items-center justify-between py-4 px-5 border border-border rounded-full hover:border-foreground/40 transition-colors cursor-pointer"
      onClick={() => router.push(`/doc/${doc.id}`)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-xs font-mono text-muted-foreground tracking-[0.1em] shrink-0">
          {formatDate(doc.updatedAt)}
        </span>
        <span className="text-muted-foreground/40">—</span>
        <h3 className="font-mono text-sm truncate">
          {doc.title || "Untitled"}
        </h3>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-full border border-border hover:border-foreground/50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl">
      <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground mb-6">
        No documents yet
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 h-10 px-5 border border-foreground text-foreground rounded-full font-mono text-xs uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        New document
      </button>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { documents, createDocument, deleteDocument } = useDocuments();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateDocument = () => {
    const id = createDocument();
    router.push(`/doc/${id}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-4 w-4 border border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
          <h1 className="text-sm font-mono uppercase tracking-[0.2em]">Nemo</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateDocument}
              className="h-9 px-4 rounded-full border border-border hover:border-foreground/50 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs font-mono uppercase tracking-wider">New</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* Section Label */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">
            Documents
          </p>
          <p className="text-xs font-mono tracking-[0.1em] text-muted-foreground">
            {documents.length} total
          </p>
        </div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <EmptyState onCreate={handleCreateDocument} />
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onDelete={() => deleteDocument(doc.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
