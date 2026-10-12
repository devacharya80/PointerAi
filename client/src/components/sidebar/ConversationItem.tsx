import { memo, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import InlineSpinner from "../ui/InlineSpinner";
import { useDeleteConversation } from "../../hooks/useDeleteConversation";
import { useRenameConversation } from "../../hooks/useRenameConversation";

interface ConversationItemProps {
  id: string;
  title: string;
  active: boolean;
  onNavigate: () => void;
}

type Mode = "idle" | "menu" | "renaming" | "confirmDelete";

function ConversationItemComponent({
  id,
  title,
  active,
  onNavigate,
}: ConversationItemProps) {
  const navigate = useNavigate();
  const label = title || "Untitled conversation";

  const [mode, setMode] = useState<Mode>("idle");
  const [draft, setDraft] = useState(label);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const del = useDeleteConversation();
  const rename = useRenameConversation();
  const busy = del.isPending || rename.isPending;

  // Close the menu on outside click or Escape
  useEffect(() => {
    if (mode !== "menu") return;

    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMode("idle");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("idle");
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  // Focus the input when rename starts
  useEffect(() => {
    if (mode === "renaming") inputRef.current?.select();
  }, [mode]);

  const startRename = () => {
    setDraft(label);
    setMode("renaming");
  };

  const submitRename = () => {
    const next = draft.trim();

    if (!next || next === label) {
      setMode("idle");
      return;
    }

    rename.mutate(
      { id, title: next },
      {
        onSuccess: () => toast.success("Conversation renamed"),
        onError: () => toast.error("Couldn't rename the conversation."),
        onSettled: () => setMode("idle"),
      },
    );
  };

  const confirmDelete = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success("Conversation deleted");
        if (active) navigate("/chat", { replace: true });
      },
      onError: () => toast.error("Couldn't delete the conversation."),
      onSettled: () => setMode("idle"),
    });
  };

  // Renaming row
  if (mode === "renaming") {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5">
        <input
          ref={inputRef}
          value={draft}
          autoFocus
          maxLength={100}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitRename();
            if (e.key === "Escape") setMode("idle");
          }}
          aria-label="Conversation title"
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-white outline-none"
        />

        {rename.isPending ? (
          <InlineSpinner />
        ) : (
          <>
            <button
              type="button"
              onClick={submitRename}
              aria-label="Save title"
              className="rounded-md p-1.5 text-emerald-400 hover:bg-white/10"
            >
              <Check size={15} />
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              aria-label="Cancel rename"
              className="rounded-md p-1.5 text-gray-400 hover:bg-white/10"
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
    );
  }

  // Delete confirmation row
  if (mode === "confirmDelete") {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-2 text-sm">
        <span className="min-w-0 flex-1 truncate pl-1 text-gray-200">
          {del.isPending ? "Deleting..." : "Delete this chat?"}
        </span>

        {del.isPending ? (
          <InlineSpinner />
        ) : (
          <>
            <button
              type="button"
              onClick={confirmDelete}
              aria-label="Confirm delete"
              className="rounded-md px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/20"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              aria-label="Cancel delete"
              className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-white/10"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    );
  }

  // Normal row, with the menu when open
  return (
    <div ref={menuRef} className="group relative">
      <Link
        to={`/chat/${id}`}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        title={label}
        className={`flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 pr-9 text-sm transition-colors ${
          active
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        }`}
      >
        <MessageSquare size={15} className="shrink-0 opacity-60" />
        <span className="truncate">{label}</span>
      </Link>

      <button
        type="button"
        onClick={() => setMode(mode === "menu" ? "idle" : "menu")}
        aria-label={`Options for ${label}`}
        aria-haspopup="menu"
        aria-expanded={mode === "menu"}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition hover:bg-white/10 hover:text-gray-200 ${
          mode === "menu"
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        }`}
      >
        {busy ? <InlineSpinner /> : <MoreHorizontal size={16} />}
      </button>

      {mode === "menu" && (
        <div
          role="menu"
          className="absolute right-1 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#202020] p-1 shadow-2xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={startRename}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5"
          >
            <Pencil size={14} />
            Rename
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => setMode("confirmDelete")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(ConversationItemComponent);