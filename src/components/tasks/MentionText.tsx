import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

/**
 * Turns http(s):// and www. URLs in a plain string into clickable links.
 */
function linkifyPlainText(text: string, keyPrefix: string): React.ReactNode[] {
  if (!text) return [];

  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let k = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      out.push(
        <span key={`${keyPrefix}-t-${k++}`}>{text.slice(lastIndex, start)}</span>
      );
    }
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    out.push(
      <a
        key={`${keyPrefix}-a-${k++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1D4ED8] underline underline-offset-2 hover:text-[#1E40AF] break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {raw}
      </a>
    );
    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) {
    out.push(<span key={`${keyPrefix}-t-${k++}`}>{text.slice(lastIndex)}</span>);
  }
  if (out.length === 0) {
    return [text];
  }
  return out;
}

/**
 * Parses a comment content string and renders @mentions (format: @Full Name)
 * as highlighted inline spans. Names are matched against the provided
 * candidate list (longest-match first to handle multi-word names).
 * Also turns URLs (http://, https://, www.) into clickable links.
 */
interface MentionTextProps {
  content: string;
  candidates: string[];
  className?: string;
}

export const MentionText: React.FC<MentionTextProps> = ({ content, candidates, className }) => {
  if (!content) return null;

  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    const atIndex = content.indexOf("@", cursor);
    if (atIndex === -1) {
      nodes.push(content.slice(cursor));
      break;
    }
    if (atIndex > cursor) {
      nodes.push(content.slice(cursor, atIndex));
    }

    const remainder = content.slice(atIndex + 1);
    const matched = sorted.find((name) => remainder.startsWith(name));

    if (matched) {
      nodes.push(
        <span
          key={`m-${atIndex}`}
          style={{
            color: "#1D4ED8",
            background: "#DBEAFE",
            padding: "0 4px",
            borderRadius: 4,
            fontWeight: 500,
          }}
        >
          @{matched}
        </span>
      );
      cursor = atIndex + 1 + matched.length;
    } else {
      nodes.push("@");
      cursor = atIndex + 1;
    }
  }

  const withLinks = nodes.flatMap((node, i) => {
    if (typeof node === "string") {
      return linkifyPlainText(node, `seg-${i}`);
    }
    return [node];
  });

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {withLinks}
    </span>
  );
};

/**
 * Scans content for @Full Name mentions and returns the matched names.
 */
export const extractMentions = (content: string, candidates: string[]): string[] => {
  if (!content) return [];
  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  const found = new Set<string>();
  let cursor = 0;
  while (cursor < content.length) {
    const atIndex = content.indexOf("@", cursor);
    if (atIndex === -1) break;
    const remainder = content.slice(atIndex + 1);
    const matched = sorted.find((name) => remainder.startsWith(name));
    if (matched) {
      found.add(matched);
      cursor = atIndex + 1 + matched.length;
    } else {
      cursor = atIndex + 1;
    }
  }
  return Array.from(found);
};
