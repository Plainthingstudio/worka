import crypto from "node:crypto";

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_RESPONSE_FORMAT = "1.8.0",
  USER_ID,
  USER_EMAIL,
  USER_NAME,
  USER_ROLE = "team",
  USER_POSITION,
  TEAM_MEMBER_DOCUMENT_ID,
  ASSIGNED_BY,
} = process.env;

const VALID_ROLES = new Set(["owner", "administrator", "team"]);

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT_ID ||
  !APPWRITE_API_KEY ||
  !APPWRITE_DATABASE_ID ||
  !USER_ID ||
  !USER_EMAIL ||
  !USER_NAME
) {
  console.error(
    "Missing required env vars. Need APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID, USER_ID, USER_EMAIL, and USER_NAME."
  );
  process.exit(1);
}

if (!VALID_ROLES.has(USER_ROLE)) {
  console.error(`Invalid USER_ROLE "${USER_ROLE}". Use one of: owner, administrator, team.`);
  process.exit(1);
}

const endpoint = APPWRITE_ENDPOINT.replace(/\/$/, "");
const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": APPWRITE_PROJECT_ID,
  "X-Appwrite-Key": APPWRITE_API_KEY,
  "X-Appwrite-Response-Format": APPWRITE_RESPONSE_FORMAT,
};

const request = async (method, path, body) => {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(payload?.message || `${method} ${path} failed`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const deterministicId = (prefix, base) =>
  `${prefix}_${crypto.createHash("sha1").update(base).digest("hex").slice(0, 24)}`;

const ensureUserExists = async () => {
  await request("GET", `/v1/users/${USER_ID}`);
  console.log(`✓ Found Appwrite user ${USER_ID}`);
};

const ensureDocument = async (collectionId, documentId, data) => {
  try {
    await request(
      "GET",
      `/v1/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`
    );
    await request(
      "PATCH",
      `/v1/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
      { data }
    );
    console.log(`✓ Updated ${collectionId}/${documentId}`);
  } catch (error) {
    if (error.status !== 404) throw error;

    await request(
      "POST",
      `/v1/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`,
      {
        documentId,
        data,
      }
    );
    console.log(`✓ Created ${collectionId}/${documentId}`);
  }
};

const defaultPosition =
  USER_ROLE === "owner"
    ? "Owner"
    : USER_ROLE === "administrator"
      ? "Administrator"
      : "Team Member";

const main = async () => {
  await ensureUserExists();

  await ensureDocument("profiles", USER_ID, {
    user_id: USER_ID,
    full_name: USER_NAME,
    email: USER_EMAIL,
  });

  await ensureDocument("user_roles", deterministicId("role", USER_ID), {
    user_id: USER_ID,
    role: USER_ROLE,
    ...(ASSIGNED_BY ? { assigned_by: ASSIGNED_BY } : {}),
  });

  await ensureDocument("team_members", TEAM_MEMBER_DOCUMENT_ID || deterministicId("team", USER_ID), {
    user_id: USER_ID,
    name: USER_NAME,
    position: USER_POSITION || defaultPosition,
    start_date: new Date().toISOString(),
    skills: [],
  });

  console.log("\nUser bootstrap completed.");
};

main().catch((error) => {
  console.error("User bootstrap failed:", error.payload || error.message);
  process.exit(1);
});
