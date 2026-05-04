import React, { useState, useRef, useEffect } from "react";
import { Paperclip, AtSign, Send, X } from "lucide-react";
import { InitialAvatar } from "@/components/ui/avatar";

interface MentionCandidate {
  user_id: string;
  name: string;
}

interface CommentInputProps {
  candidates: MentionCandidate[];
  onSubmit: (content: string, files: File[], mentionedUserIds: string[]) => Promise<boolean>;
  isSubmitting?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const CommentInput: React.FC<CommentInputProps> = ({
  candidates,
  onSubmit,
  isSubmitting = false,
}) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionAnchor, setMentionAnchor] = useState<number>(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCandidates = mentionQuery === null
    ? []
    : candidates.filter((c) =>
        c.name.toLowerCase().startsWith(mentionQuery.toLowerCase())
      ).slice(0, 6);

  useEffect(() => {
    setHighlightIndex(0);
  }, [mentionQuery]);

  const detectMention = (value: string, cursor: number) => {
    const before = value.slice(0, cursor);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) {
      setMentionQuery(null);
      return;
    }
    const charBefore = atIdx === 0 ? " " : before[atIdx - 1];
    if (charBefore !== " " && charBefore !== "\n" && atIdx !== 0) {
      setMentionQuery(null);
      return;
    }
    const frag = before.slice(atIdx + 1);
    if (/\n/.test(frag)) {
      setMentionQuery(null);
      return;
    }
    setMentionAnchor(atIdx);
    setMentionQuery(frag);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContent(v);
    const cursor = e.target.selectionStart ?? v.length;
    detectMention(v, cursor);
  };

  const insertMention = (candidate: MentionCandidate) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? content.length;
    const before = content.slice(0, mentionAnchor);
    const after = content.slice(cursor);
    const inserted = `@${candidate.name} `;
    const newValue = before + inserted + after;
    setContent(newValue);
    setMentionQuery(null);
    // Restore cursor after inserted mention
    requestAnimationFrame(() => {
      ta.focus();
      const pos = (before + inserted).length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredCandidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % filteredCandidates.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + filteredCandidates.length) % filteredCandidates.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredCandidates[highlightIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTriggerMention = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    const cursor = ta.selectionStart ?? content.length;
    const before = content.slice(0, cursor);
    const after = content.slice(cursor);
    const needsSpace = cursor > 0 && before[cursor - 1] !== " " && before[cursor - 1] !== "\n";
    const insertion = (needsSpace ? " " : "") + "@";
    const newValue = before + insertion + after;
    setContent(newValue);
    const newCursor = cursor + insertion.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
      detectMention(newValue, newCursor);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    const valid = picked.filter((f) => {
      if (f.size > 50 * 1024 * 1024) {
        alert(`File "${f.name}" is too large. Max 50MB.`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const extractMentionedIds = (text: string): string[] => {
    const sorted = [...candidates].sort((a, b) => b.name.length - a.name.length);
    const ids = new Set<string>();
    let cursor = 0;
    while (cursor < text.length) {
      const atIdx = text.indexOf("@", cursor);
      if (atIdx === -1) break;
      const remainder = text.slice(atIdx + 1);
      const matched = sorted.find((c) => remainder.startsWith(c.name));
      if (matched) {
        ids.add(matched.user_id);
        cursor = atIdx + 1 + matched.name.length;
      } else {
        cursor = atIdx + 1;
      }
    }
    return Array.from(ids);
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    const mentioned = extractMentionedIds(content);
    const ok = await onSubmit(content, files, mentioned);
    if (ok) {
      setContent("");
      setFiles([]);
      setMentionQuery(null);
    }
  };

  return (
    <div
      className="relative bg-card border border-border-soft"
      style={{
        borderRadius: 12,
        padding: 12,
      }}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Add a comment..."
        rows={3}
        className="w-full resize-none outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          lineHeight: "20px",
          minHeight: 60,
        }}
      />

      {/* Mention dropdown */}
      {mentionQuery !== null && filteredCandidates.length > 0 && (
        <div
          className="absolute bottom-full mb-1 left-0 bg-popover border border-border-soft shadow-lg z-10 py-1 min-w-[220px]"
          style={{ borderRadius: 8 }}
        >
          {filteredCandidates.map((c, i) => (
            <button
              type="button"
              key={c.user_id}
              onClick={() => insertMention(c)}
              onMouseEnter={() => setHighlightIndex(i)}
              className="w-full text-left flex items-center gap-2 text-foreground"
              style={{
                padding: "6px 10px",
                background: i === highlightIndex ? "hsl(var(--surface-hover))" : "transparent",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
              }}
            >
              <InitialAvatar name={c.name} size={24} />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface-2 px-2 py-1 rounded text-xs">
              <Paperclip className="text-muted-foreground" style={{ width: 12, height: 12 }} strokeWidth={1.67} />
              <span className="truncate flex-1 text-foreground">{f.name}</span>
              <span className="text-muted-foreground">{formatFileSize(f.size)}</span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="hover:bg-accent text-foreground rounded p-0.5"
              >
                <X style={{ width: 12, height: 12 }} strokeWidth={1.67} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center transition-colors hover:bg-accent"
            style={{ width: 28, height: 28, borderRadius: 6 }}
            aria-label="Attach file"
            title="Attach file"
          >
            <Paperclip className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
          </button>
          <button
            type="button"
            onClick={handleTriggerMention}
            className="inline-flex items-center justify-center transition-colors hover:bg-accent"
            style={{ width: 28, height: 28, borderRadius: 6 }}
            aria-label="Mention user"
            title="Mention user"
          >
            <AtSign className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && files.length === 0)}
          className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 bg-brand text-brand-foreground"
          style={{
            gap: 6,
            padding: "6px 10px",
            height: 28,
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
            boxShadow:
              "0px 1px 2px rgba(14,18,27,0.239216), 0px 0px 0px 1px hsl(var(--brand))",
            borderRadius: 7,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Send className="text-brand-foreground" style={{ width: 12, height: 12 }} strokeWidth={1.67} />
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
