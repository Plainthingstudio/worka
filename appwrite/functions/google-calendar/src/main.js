import crypto from "node:crypto";
import fetch from "node-fetch";

const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.APPWRITE_FUNCTION_API_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_CALENDAR_APP_URL = process.env.GOOGLE_CALENDAR_APP_URL;
const GOOGLE_STATE_SECRET = process.env.GOOGLE_STATE_SECRET;
const PROFILE_COLLECTION_ID = "profiles";
const CONNECTION_COLLECTION_ID = "google_calendar_connections";
const APPWRITE_RESPONSE_FORMAT = "1.8.0";

const jsonHeaders = (apiKey) => ({
  "Content-Type": "application/json",
  "X-Appwrite-Project": APPWRITE_PROJECT_ID,
  "X-Appwrite-Key": apiKey,
  "X-Appwrite-Response-Format": APPWRITE_RESPONSE_FORMAT,
});

const isConfigured = () =>
  Boolean(
    APPWRITE_ENDPOINT &&
      APPWRITE_PROJECT_ID &&
      DATABASE_ID &&
      GOOGLE_CLIENT_ID &&
      GOOGLE_CLIENT_SECRET &&
      GOOGLE_REDIRECT_URI &&
      GOOGLE_CALENDAR_APP_URL &&
      GOOGLE_STATE_SECRET
  );

const ensureConfigured = () => {
  if (!isConfigured()) {
    throw new Error(
      "Google Calendar Appwrite Function is not fully configured. Set APPWRITE_DATABASE_ID, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_CALENDAR_APP_URL, and GOOGLE_STATE_SECRET."
    );
  }
};

const getApiKey = (req) => {
  const apiKey = APPWRITE_API_KEY || req.headers["x-appwrite-key"];

  if (!apiKey) {
    const err = new Error(
      "Missing Appwrite API key. Set APPWRITE_API_KEY for HTTP callback executions or invoke the function through Appwrite client execution."
    );
    err.status = 500;
    throw err;
  }

  return apiKey;
};

const buildAppwriteUrl = (path) => {
  const endpoint = APPWRITE_ENDPOINT.replace(/\/$/, "");
  const normalizedPath =
    endpoint.endsWith("/v1") && path.startsWith("/v1/") ? path.slice(3) : path;

  return `${endpoint}${normalizedPath}`;
};

const getRequestUrl = (req) => {
  const rawPath = typeof req.path === "string" ? req.path : "/";
  const queryString =
    typeof req.queryString === "string"
      ? req.queryString
      : typeof req.querystring === "string"
        ? req.querystring
        : "";
  const pathWithQuery = rawPath.includes("?") || !queryString ? rawPath : `${rawPath}?${queryString}`;

  return new URL(`https://function.local${pathWithQuery}`);
};

const appwriteRequest = async (apiKey, method, path, body) => {
  const response = await fetch(buildAppwriteUrl(path), {
    method,
    headers: jsonHeaders(apiKey),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(payload?.message || `Appwrite request failed: ${method} ${path}`);
    err.status = response.status;
    throw err;
  }

  return payload;
};

const withLegacyFallback = async (runModern, runLegacy) => {
  try {
    return await runModern();
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const shouldRetryAsLegacy =
      error?.status === 404 &&
      (message.includes("route not found") || message.includes("api route is valid"));

    if (!shouldRetryAsLegacy) {
      throw error;
    }

    return await runLegacy();
  }
};

const getDocument = async (apiKey, collectionId, documentId) => {
  try {
    return await withLegacyFallback(
      () =>
        appwriteRequest(
          apiKey,
          "GET",
          `/v1/tablesdb/${DATABASE_ID}/tables/${collectionId}/rows/${documentId}`
        ),
      () =>
        appwriteRequest(
          apiKey,
          "GET",
          `/v1/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`
        )
    );
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

const updateDocument = async (apiKey, collectionId, documentId, data) =>
  withLegacyFallback(
    () =>
      appwriteRequest(
        apiKey,
        "PATCH",
        `/v1/tablesdb/${DATABASE_ID}/tables/${collectionId}/rows/${documentId}`,
        { data }
      ),
    () =>
      appwriteRequest(
        apiKey,
        "PATCH",
        `/v1/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
        { data }
      )
  );

const createDocument = async (apiKey, collectionId, documentId, data, permissions = []) =>
  withLegacyFallback(
    () =>
      appwriteRequest(
        apiKey,
        "POST",
        `/v1/tablesdb/${DATABASE_ID}/tables/${collectionId}/rows`,
        { rowId: documentId, data, permissions }
      ),
    () =>
      appwriteRequest(
        apiKey,
        "POST",
        `/v1/databases/${DATABASE_ID}/collections/${collectionId}/documents`,
        { documentId, data, permissions }
      )
  );

const deleteDocument = async (apiKey, collectionId, documentId) => {
  try {
    await withLegacyFallback(
      () =>
        appwriteRequest(
          apiKey,
          "DELETE",
          `/v1/tablesdb/${DATABASE_ID}/tables/${collectionId}/rows/${documentId}`
        ),
      () =>
        appwriteRequest(
          apiKey,
          "DELETE",
          `/v1/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`
        )
    );
  } catch (error) {
    if (error.status === 404) return;
    throw error;
  }
};

const ensureUserId = (req) => {
  const userId = req.headers["x-appwrite-user-id"];
  if (!userId) {
    const err = new Error("Authentication required.");
    err.status = 401;
    throw err;
  }
  return userId;
};

const createState = (userId) => {
  const payload = {
    userId,
    exp: Date.now() + 10 * 60 * 1000,
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", GOOGLE_STATE_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
};

const verifyState = (state) => {
  if (!state || !state.includes(".")) {
    throw new Error("Missing or invalid OAuth state.");
  }

  const [encodedPayload, signature] = state.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", GOOGLE_STATE_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid OAuth state signature.");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (!payload?.userId || !payload?.exp || Date.now() > payload.exp) {
    throw new Error("Expired OAuth state.");
  }

  return payload;
};

const buildRedirectUrl = (status, message) => {
  const target = new URL("/settings", GOOGLE_CALENDAR_APP_URL);
  target.searchParams.set("tab", "integrations");
  target.searchParams.set("googleCalendar", status);
  if (message) {
    target.searchParams.set("googleCalendarMessage", String(message).slice(0, 180));
  }
  return target.toString();
};

const syncProfileMetadata = async (apiKey, userId, data) => {
  const nextData = {
    google_calendar_connected: data.connected ?? false,
    ...(data.email !== undefined ? { google_calendar_email: data.email } : {}),
    ...(data.syncSource !== undefined ? { google_calendar_sync_source: data.syncSource } : {}),
    ...(data.connectedAt !== undefined ? { google_calendar_connected_at: data.connectedAt } : {}),
  };

  await updateDocument(apiKey, PROFILE_COLLECTION_ID, userId, nextData);
};

const exchangeAuthorizationCode = async (code) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const err = new Error(payload.error_description || payload.error || "Failed to exchange Google authorization code.");
    err.status = response.status;
    throw err;
  }

  return payload;
};

const refreshGoogleAccessToken = async (connection) => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: connection.refresh_token,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const err = new Error(payload.error_description || payload.error || "Failed to refresh Google Calendar access token.");
    err.status = response.status;
    throw err;
  }

  return payload;
};

const getAccessTokenExpiry = (expiresInSeconds) =>
  new Date(Date.now() + Math.max(Number(expiresInSeconds || 3600) - 60, 1) * 1000).toISOString();

const ensureValidAccessToken = async (apiKey, userId) => {
  const connection = await getDocument(apiKey, CONNECTION_COLLECTION_ID, userId);

  if (!connection?.refresh_token) {
    const err = new Error("Google Calendar is not connected.");
    err.status = 401;
    throw err;
  }

  if (
    connection.access_token &&
    connection.access_token_expires_at &&
    new Date(connection.access_token_expires_at).getTime() > Date.now()
  ) {
    return connection.access_token;
  }

  try {
    const refreshed = await refreshGoogleAccessToken(connection);
    await updateDocument(apiKey, CONNECTION_COLLECTION_ID, userId, {
      access_token: refreshed.access_token,
      access_token_expires_at: getAccessTokenExpiry(refreshed.expires_in),
      ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
    });

    return refreshed.access_token;
  } catch (error) {
    if (String(error.message || "").includes("invalid_grant")) {
      await deleteDocument(apiKey, CONNECTION_COLLECTION_ID, userId);
      await syncProfileMetadata(apiKey, userId, { connected: false });
      const authError = new Error("Google Calendar access was revoked or expired. Please reconnect.");
      authError.status = 401;
      throw authError;
    }
    throw error;
  }
};

const fetchEventsForDate = async (accessToken, date) => {
  const query = new URLSearchParams({
    timeMin: date.start,
    timeMax: date.end,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const response = await fetch(`${GOOGLE_EVENTS_URL}?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = await response.json();

  if (response.status === 401) {
    const err = new Error("Google Calendar access token was rejected.");
    err.status = 401;
    throw err;
  }

  if (!response.ok) {
    const err = new Error(payload.error?.message || "Failed to fetch Google Calendar events.");
    err.status = response.status;
    throw err;
  }

  const events = (payload.items || []).map((item) => ({
    id: item.id,
    title: item.summary || "Untitled event",
    start: item.start?.dateTime || item.start?.date,
    end: item.end?.dateTime || item.end?.date,
    htmlLink: item.htmlLink,
    isAllDay: Boolean(item.start?.date && !item.start?.dateTime),
  }));

  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
};

const handleStatus = async (req, res) => {
  ensureConfigured();

  const apiKey = getApiKey(req);
  const userId = ensureUserId(req);
  const profile = await getDocument(apiKey, PROFILE_COLLECTION_ID, userId);
  const connection = await getDocument(apiKey, CONNECTION_COLLECTION_ID, userId);
  const isConnected = Boolean(connection?.refresh_token);

  return res.json(
    {
      isConfigured: true,
      connected: isConnected,
      email: connection?.provider_email || profile?.google_calendar_email || profile?.email || undefined,
      syncSource: connection?.sync_source || profile?.google_calendar_sync_source || undefined,
      connectedAt: connection?.connected_at || profile?.google_calendar_connected_at || undefined,
      needsReconnect: Boolean(!isConnected && profile?.google_calendar_connected),
    },
    200
  );
};

const handleConnectStart = async (req, res) => {
  ensureConfigured();

  const userId = ensureUserId(req);
  const state = createState(userId);
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", GOOGLE_CALENDAR_SCOPE);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  return res.json({ authUrl: authUrl.toString() }, 200);
};

const handleCallback = async (req, res, log, error) => {
  ensureConfigured();

  const requestUrl = getRequestUrl(req);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !state) {
    return res.redirect(buildRedirectUrl("error", "Missing Google OAuth code or state."));
  }

  try {
    const apiKey = getApiKey(req);
    const { userId } = verifyState(state);
    log(`google-calendar callback start userId=${userId}`);
    const tokenPayload = await exchangeAuthorizationCode(code);
    log(
      `google-calendar token exchange success userId=${userId} hasRefreshToken=${Boolean(
        tokenPayload.refresh_token
      )}`
    );
    const profile = await getDocument(apiKey, PROFILE_COLLECTION_ID, userId);
    const connectedAt = new Date().toISOString();
    const existingConnection = await getDocument(apiKey, CONNECTION_COLLECTION_ID, userId);
    const refreshToken = tokenPayload.refresh_token || existingConnection?.refresh_token;

    if (!refreshToken) {
      throw new Error("Google did not return a refresh token. Please reconnect and grant consent again.");
    }

    const connectionData = {
      user_id: userId,
      provider_email: profile?.email || "",
      sync_source: "primary",
      connected_at: connectedAt,
      refresh_token: refreshToken,
      access_token: tokenPayload.access_token,
      access_token_expires_at: getAccessTokenExpiry(tokenPayload.expires_in),
    };

    if (existingConnection) {
      log(`google-calendar updating existing connection userId=${userId}`);
      await updateDocument(apiKey, CONNECTION_COLLECTION_ID, userId, connectionData);
    } else {
      log(`google-calendar creating new connection userId=${userId}`);
      await createDocument(apiKey, CONNECTION_COLLECTION_ID, userId, connectionData);
    }

    await syncProfileMetadata(apiKey, userId, {
      connected: true,
      email: profile?.email || "",
      syncSource: "primary",
      connectedAt,
    });
    log(`google-calendar callback success userId=${userId}`);

    return res.redirect(buildRedirectUrl("connected"));
  } catch (err) {
    error(err?.message || "Google Calendar callback failed.");
    log(
      JSON.stringify({
        path: req.path,
        message: err?.message || "Google Calendar callback failed.",
        status: err?.status || 500,
      })
    );
    return res.redirect(buildRedirectUrl("error", err?.message || "Google Calendar callback failed."));
  }
};

const handleDisconnect = async (req, res) => {
  ensureConfigured();

  const apiKey = getApiKey(req);
  const userId = ensureUserId(req);

  await deleteDocument(apiKey, CONNECTION_COLLECTION_ID, userId);
  await syncProfileMetadata(apiKey, userId, { connected: false });

  return res.json({ success: true }, 200);
};

const handleEvents = async (req, res) => {
  ensureConfigured();

  const apiKey = getApiKey(req);
  const userId = ensureUserId(req);
  const requestUrl = getRequestUrl(req);
  const date = requestUrl.searchParams.get("date");
  const start = requestUrl.searchParams.get("start");
  const end = requestUrl.searchParams.get("end");

  if (
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !start ||
    Number.isNaN(new Date(start).getTime()) ||
    !end ||
    Number.isNaN(new Date(end).getTime())
  ) {
    return res.json({ message: "Missing or invalid date range query." }, 400);
  }

  try {
    let accessToken = await ensureValidAccessToken(apiKey, userId);

    try {
      const events = await fetchEventsForDate(accessToken, { date, start, end });
      return res.json({ events }, 200);
    } catch (error) {
      if (error.status !== 401) throw error;

      const connection = await getDocument(apiKey, CONNECTION_COLLECTION_ID, userId);
      const refreshed = await refreshGoogleAccessToken(connection);
      await updateDocument(apiKey, CONNECTION_COLLECTION_ID, userId, {
        access_token: refreshed.access_token,
        access_token_expires_at: getAccessTokenExpiry(refreshed.expires_in),
        ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
      });
      accessToken = refreshed.access_token;
      const events = await fetchEventsForDate(accessToken, { date, start, end });
      return res.json({ events }, 200);
    }
  } catch (error) {
    const status = error.status || 500;
    return res.json({ message: error.message || "Failed to fetch Google Calendar events." }, status);
  }
};

export default async ({ req, res, log, error }) => {
  try {
    if (req.method === "GET" && req.path.startsWith("/status")) {
      return await handleStatus(req, res);
    }

    if (req.method === "POST" && req.path === "/connect/start") {
      return await handleConnectStart(req, res);
    }

    if (req.method === "GET" && req.path.startsWith("/oauth/callback")) {
      return await handleCallback(req, res, log, error);
    }

    if (req.method === "POST" && req.path === "/disconnect") {
      return await handleDisconnect(req, res);
    }

    if (req.method === "GET" && req.path.startsWith("/events")) {
      return await handleEvents(req, res);
    }

    return res.json({ message: "Not found." }, 404);
  } catch (err) {
    error(err?.message || "Unhandled Google Calendar function error.");
    return res.json({ message: err?.message || "Unhandled Google Calendar function error." }, err?.status || 500);
  }
};
