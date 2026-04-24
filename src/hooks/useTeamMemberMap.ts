import { useState, useEffect } from "react";
import { databases, DATABASE_ID } from "@/integrations/appwrite/client";

interface MemberEntry {
  userId: string;
  name: string;
  initials: string;
}

export const useTeamMemberMap = () => {
  const [map, setMap] = useState<Record<string, MemberEntry>>({});

  useEffect(() => {
    databases
      .listDocuments(DATABASE_ID, "team_members")
      .then(res => {
        const built: Record<string, MemberEntry> = {};
        res.documents.forEach((m: any) => {
          if (m.user_id) {
            const name: string = m.name || "Unknown";
            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p: string) => p[0].toUpperCase())
              .join("");
            built[m.user_id] = { userId: m.user_id, name, initials };
          }
        });
        setMap(built);
      })
      .catch(() => {});
  }, []);

  const getMember = (userId?: string): MemberEntry | null => {
    if (!userId) return null;
    return map[userId] ?? null;
  };

  return { getMember };
};
