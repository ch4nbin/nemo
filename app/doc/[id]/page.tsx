"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Editor } from "@/components/editor";
import { useDocuments } from "@/lib/documents";
import { ArrowLeft, Trash2, Check, Loader2 } from "lucide-react";

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const getDocument = useDocuments((state) => state.getDocument);
  const updateDocument = useDocuments((state) => state.updateDocument);
  const deleteDocument = useDocuments((state) => state.deleteDocument);
  const [mounted, setMounted] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const doc = getDocument(id);
      if (doc) {
        setDocumentTitle(doc.title);
        setContent(doc.content);
        const text = doc.content.replace(/<[^>]*>/g, "");
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
      } else {
        router.push("/");
      }
    }
  }, [mounted, id, getDocument, router]);

  useEffect(() => {
    if (!mounted) return;
    const doc = getDocument(id);
    if (doc && documentTitle !== doc.title) {
      setSaveStatus("saving");
      const timer = setTimeout(() => {
        updateDocument(id, { title: documentTitle });
        setSaveStatus("saved");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [documentTitle, id, mounted, updateDocument, getDocument]);

  useEffect(() => {
    if (!mounted) return;
    const doc = getDocument(id);
    if (doc && content !== doc.content) {
      setSaveStatus("saving");
      const timer = setTimeout(() => {
        updateDocument(id, { content });
        setSaveStatus("saved");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content, id, mounted, updateDocument, getDocument]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    const text = newContent.replace(/<[^>]*>/g, "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument(id);
      router.push("/");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-4 w-4 border border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="h-9 w-9 rounded-full border border-border hover:border-foreground/50 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-sm font-mono bg-transparent border-none focus:outline-none w-auto min-w-[120px] max-w-[400px]"
                placeholder="Untitled"
              />
              
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground tracking-[0.1em]">
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>SAVING</span>
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>SAVED</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="h-9 w-9 rounded-full border border-border hover:border-foreground/50 flex items-center justify-center transition-colors"
              title="Delete document"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button className="h-9 px-4 rounded-full border border-border hover:border-foreground/50 flex items-center gap-2 transition-colors">
              <span className="text-xs font-mono uppercase tracking-[0.15em]">Share</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 flex flex-col py-8">
        <Editor initialContent={content} onUpdate={handleContentChange} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-8">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground tracking-[0.1em] max-w-5xl mx-auto">
          <span>{wordCount} WORDS</span>
          <span>NEMO</span>
        </div>
      </footer>
    </div>
  );
}
