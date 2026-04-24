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

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

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

const createAttribute = async ({ databaseId, collectionId, attribute }) => {
  const basePath = `/v1/databases/${databaseId}/collections/${collectionId}/attributes`;

  switch (attribute.type) {
    case "string":
      return request("POST", `${basePath}/string`, {
        key: attribute.key,
        size: attribute.size,
        required: attribute.required,
        default: attribute.default,
        array: attribute.array,
      });
    case "email":
      return request("POST", `${basePath}/email`, {
        key: attribute.key,
        required: attribute.required,
        default: attribute.default,
        array: attribute.array,
      });
    case "enum":
      return request("POST", `${basePath}/enum`, {
        key: attribute.key,
        elements: attribute.elements,
        required: attribute.required,
        default: attribute.default,
        array: attribute.array,
      });
    case "float":
      return request("POST", `${basePath}/float`, {
        key: attribute.key,
        required: attribute.required,
        min: attribute.min,
        max: attribute.max,
        default: attribute.default,
        array: attribute.array,
      });
    case "integer":
      return request("POST", `${basePath}/integer`, {
        key: attribute.key,
        required: attribute.required,
        min: attribute.min,
        max: attribute.max,
        default: attribute.default,
        array: attribute.array,
      });
    case "boolean":
      return request("POST", `${basePath}/boolean`, {
        key: attribute.key,
        required: attribute.required,
        default: attribute.default,
        array: attribute.array,
      });
    case "datetime":
      return request("POST", `${basePath}/datetime`, {
        key: attribute.key,
        required: attribute.required,
        default: attribute.default,
        array: attribute.array,
      });
    default:
      throw new Error(`Unsupported attribute type: ${attribute.type}`);
  }
};

const waitForAttribute = async ({ databaseId, collectionId, attributeKey }) => {
  const path = `/v1/databases/${databaseId}/collections/${collectionId}/attributes/${attributeKey}`;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const attribute = await request("GET", path);

    if (attribute.status === "available") {
      return attribute;
    }

    if (attribute.status === "failed") {
      throw new Error(`Attribute ${collectionId}.${attributeKey} failed to build`);
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for attribute ${collectionId}.${attributeKey}`);
};

const ensureAttribute = async ({ databaseId, collectionId, attribute }) => {
  const path = `/v1/databases/${databaseId}/collections/${collectionId}/attributes/${attribute.key}`;

  try {
    const existing = await request("GET", path);
    if (existing.status !== "available") {
      await waitForAttribute({ databaseId, collectionId, attributeKey: attribute.key });
    }
    console.log(`✓ Attribute ${collectionId}.${attribute.key} already exists`);
    return;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  await createAttribute({ databaseId, collectionId, attribute });
  await waitForAttribute({ databaseId, collectionId, attributeKey: attribute.key });
  console.log(`✓ Created attribute ${collectionId}.${attribute.key}`);
};

const waitForIndex = async ({ databaseId, collectionId, indexKey }) => {
  const path = `/v1/databases/${databaseId}/collections/${collectionId}/indexes/${indexKey}`;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const index = await request("GET", path);

    if (index.status === "available") {
      return index;
    }

    if (index.status === "failed") {
      throw new Error(`Index ${collectionId}.${indexKey} failed to build`);
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for index ${collectionId}.${indexKey}`);
};

const ensureIndex = async ({ databaseId, collectionId, index }) => {
  const getPath = `/v1/databases/${databaseId}/collections/${collectionId}/indexes/${index.key}`;

  try {
    const existing = await request("GET", getPath);
    if (existing.status !== "available") {
      await waitForIndex({ databaseId, collectionId, indexKey: index.key });
    }
    console.log(`✓ Index ${collectionId}.${index.key} already exists`);
    return;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  await request(
    "POST",
    `/v1/databases/${databaseId}/collections/${collectionId}/indexes`,
    index
  );
  await waitForIndex({ databaseId, collectionId, indexKey: index.key });
  console.log(`✓ Created index ${collectionId}.${index.key}`);
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

    for (const attribute of collection.attributes) {
      await ensureAttribute({
        databaseId: database.id,
        collectionId: collection.collectionId,
        attribute,
      });
    }

    for (const index of collection.indexes) {
      await ensureIndex({
        databaseId: database.id,
        collectionId: collection.collectionId,
        index,
      });
    }
  }

  console.log("\nAppwrite production bootstrap completed.");
};

main().catch((error) => {
  console.error("Bootstrap failed:", error.payload || error.message);
  process.exit(1);
});
