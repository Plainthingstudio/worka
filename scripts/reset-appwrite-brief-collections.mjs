const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_RESPONSE_FORMAT = "1.8.0",
} = process.env;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY || !APPWRITE_DATABASE_ID) {
  console.error(
    "Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, or APPWRITE_DATABASE_ID."
  );
  process.exit(1);
}

const COLLECTION_IDS = [
  "graphic_design_briefs",
  "ui_design_briefs",
  "illustration_design_briefs",
];

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": APPWRITE_PROJECT_ID,
  "X-Appwrite-Key": APPWRITE_API_KEY,
  "X-Appwrite-Response-Format": APPWRITE_RESPONSE_FORMAT,
};

const request = async (method, path) => {
  const response = await fetch(`${APPWRITE_ENDPOINT.replace(/\/$/, "")}${path}`, {
    method,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

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

const main = async () => {
  for (const collectionId of COLLECTION_IDS) {
    try {
      await request(
        "DELETE",
        `/v1/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}`
      );
      console.log(`✓ Deleted ${collectionId}`);
    } catch (error) {
      if (error.status === 404) {
        console.log(`✓ ${collectionId} already absent`);
        continue;
      }

      throw error;
    }
  }
};

main().catch((error) => {
  console.error("Reset failed:", error.payload || error.message);
  process.exit(1);
});
