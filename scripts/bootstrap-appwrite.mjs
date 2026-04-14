import { APPWRITE_PRODUCTION_SCHEMA } from "./appwrite.production.schema.mjs";

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_RESPONSE_FORMAT = "1.8.0",
} = process.env;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error(
    "Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY environment variables."
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": APPWRITE_PROJECT_ID,
  "X-Appwrite-Key": APPWRITE_API_KEY,
  "X-Appwrite-Response-Format": APPWRITE_RESPONSE_FORMAT,
};

const request = async (method, path, body) => {
  const response = await fetch(`${APPWRITE_ENDPOINT.replace(/\/$/, "")}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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

const getOrCreate = async ({ label, getPath, createPath, createBody }) => {
  try {
    const existing = await request("GET", getPath);
    console.log(`✓ ${label} already exists`);
    return existing;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  const created = await request("POST", createPath, createBody);
  console.log(`✓ Created ${label}`);
  return created;
};

const main = async () => {
  const { database, collections, buckets } = APPWRITE_PRODUCTION_SCHEMA;

  await getOrCreate({
    label: `database ${database.id}`,
    getPath: `/v1/databases/${database.id}`,
    createPath: "/v1/databases",
    createBody: {
      databaseId: database.id,
      name: database.name,
      enabled: true,
    },
  });

  for (const bucket of buckets) {
    await getOrCreate({
      label: `bucket ${bucket.bucketId}`,
      getPath: `/v1/storage/buckets/${bucket.bucketId}`,
      createPath: "/v1/storage/buckets",
      createBody: bucket,
    });
  }

  for (const collection of collections) {
    await getOrCreate({
      label: `collection ${collection.collectionId}`,
      getPath: `/v1/databases/${database.id}/collections/${collection.collectionId}`,
      createPath: `/v1/databases/${database.id}/collections`,
      createBody: collection,
    });
  }

  console.log("\nAppwrite production bootstrap completed.");
};

main().catch((error) => {
  console.error("Bootstrap failed:", error.payload || error.message);
  process.exit(1);
});
