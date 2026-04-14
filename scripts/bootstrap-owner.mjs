import crypto from "node:crypto";

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_RESPONSE_FORMAT = "1.8.0",
  OWNER_USER_ID,
  OWNER_EMAIL,
  OWNER_NAME,
  OWNER_POSITION = "Co-Founder",
  OWNER_PASSWORD,
  OWNER_CREATE_USER = "false",
} = process.env;

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT_ID ||
  !APPWRITE_API_KEY ||
  !APPWRITE_DATABASE_ID ||
  !OWNER_USER_ID ||
  !OWNER_EMAIL ||
  !OWNER_NAME
) {
  console.error(
    "Missing required env vars. Need APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID, OWNER_USER_ID, OWNER_EMAIL, and OWNER_NAME."
  );
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

const ensureUser = async () => {
  if (OWNER_CREATE_USER !== "true") {
    console.log("Skipping Appwrite user creation; using existing OWNER_USER_ID.");
    return;
  }

  if (!OWNER_PASSWORD) {
    throw new Error("OWNER_PASSWORD is required when OWNER_CREATE_USER=true.");
  }

  try {
    await request("GET", `/v1/users/${OWNER_USER_ID}`);
    console.log(`✓ User ${OWNER_USER_ID} already exists`);
    return;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  await request("POST", "/v1/users", {
    userId: OWNER_USER_ID,
    email: OWNER_EMAIL,
    password: OWNER_PASSWORD,
    name: OWNER_NAME,
  });

  console.log(`✓ Created Appwrite user ${OWNER_USER_ID}`);
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
      data
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

const main = async () => {
  await ensureUser();

  await ensureDocument("profiles", OWNER_USER_ID, {
    user_id: OWNER_USER_ID,
    full_name: OWNER_NAME,
    email: OWNER_EMAIL,
  });

  await ensureDocument("user_roles", deterministicId("role", OWNER_USER_ID), {
    user_id: OWNER_USER_ID,
    role: "owner",
  });

  await ensureDocument("team_members", deterministicId("team", OWNER_USER_ID), {
    user_id: OWNER_USER_ID,
    name: OWNER_NAME,
    position: OWNER_POSITION,
    start_date: new Date().toISOString(),
    skills: [],
  });

  console.log("\nOwner bootstrap completed.");
};

main().catch((error) => {
  console.error("Owner bootstrap failed:", error.payload || error.message);
  process.exit(1);
});
