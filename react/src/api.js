const localApiOrigin = process.env.VITE_API_ORIGIN || "http://localhost:3000"; 
const sessionStorageKey = "session";
const userStorageKey = "user";

function IsJsonLike(text, contentType) {
  if (contentType.includes("json")) {
    return true;
  }

  return (
    text === "null" ||
    text === "true" ||
    text === "false" ||
    text.startsWith("{") ||
    text.startsWith("[") ||
    text.startsWith('"') ||
    /^-?\d/.test(text)
  );
}

function BuildRequestUrls(url) {
  if (
    typeof window === "undefined" ||
    /^https?:\/\//.test(url) ||
    !url.startsWith("/api/") ||
    !["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return [url];
  }
  console.log(localApiOrigin);
  return [url, `${localApiOrigin}${url.replace(/^\/api/, "")}`];
}

function ShouldRetryAgainstBackend(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "TypeError" ||
    error.message.includes("status 500") ||
    error.message.includes("status 502") ||
    error.message.includes("status 503") ||
    error.message.includes("status 504") ||
    error.message.includes("returned HTML instead of JSON") ||
    error.message.includes("returned invalid JSON")
  );
}

function NormalizeRequestError(error) {
  if (error instanceof TypeError) {
    return new Error(
      "Could not reach the backend server. Make sure the backend is running on http://localhost:3000."
    );
  }

  if (
    error instanceof Error &&
    (
      error.message.includes("JSON.parse") ||
      error.message.includes("unexpected end of data") ||
      error.message.includes("Unexpected end of JSON input")
    )
  ) {
    return new Error(
      "The server returned an empty or invalid JSON response."
    );
  }

  return error;
}

export function GetErrorMessage(error, fallbackMessage) {
  const normalizedError = NormalizeRequestError(error);

  if (normalizedError instanceof Error && normalizedError.message) {
    return normalizedError.message;
  }

  return fallbackMessage;
}

export function ReadStoredJson(key) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(key);
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    if (value !== null) {
      localStorage.removeItem(key);
    }

    return null;
  }

  try {
    return JSON.parse(normalizedValue);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function WriteStoredJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function ClearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(userStorageKey);
  localStorage.removeItem(sessionStorageKey);
}

export function ReadStoredSession() {
  const session = ReadStoredJson(sessionStorageKey);

  if (
    !session ||
    typeof session !== "object" ||
    typeof session.token !== "string" ||
    session.token.trim() === ""
  ) {
    if (session !== null) {
      ClearStoredAuth();
    }

    return null;
  }

  if (session.expiresAt) {
    const expiresAt = Date.parse(session.expiresAt);

    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      ClearStoredAuth();
      return null;
    }
  }

  return {
    token: session.token.trim(),
    expiresAt: session.expiresAt ?? null,
  };
}

export function ReadStoredUser() {
  if (!ReadStoredSession()) {
    return null;
  }

  return ReadStoredJson(userStorageKey);
}

export function WriteStoredAuth({ user, sessionToken, sessionExpiresAt }) {
  WriteStoredJson(userStorageKey, user);
  WriteStoredJson(sessionStorageKey, {
    token: sessionToken,
    expiresAt: sessionExpiresAt ?? null,
  });
}

export function UpdateStoredUser(patch) {
  const currentUser = ReadStoredUser();

  if (!currentUser || !patch || typeof patch !== "object") {
    return;
  }

  WriteStoredJson(userStorageKey, {
    ...currentUser,
    ...patch,
  });
}

function BuildAuthenticatedHeaders(headers) {
  const nextHeaders = new Headers(headers ?? {});

  if (typeof window === "undefined") {
    return nextHeaders;
  }

  const session = ReadStoredSession();

  if (!session) {
    return nextHeaders;
  }

  nextHeaders.set("Authorization", `Bearer ${session.token}`);

  return nextHeaders;
}

function BuildRequestOptions(options) {
  return {
    ...options,
    headers: BuildAuthenticatedHeaders(options?.headers),
  };
}

export async function ReadJson(response) {
  const rawText = await response.text();
  const text = rawText.trim();
  const contentType = response.headers.get("content-type") ?? "";

  if (!text) {
    return null;
  }

  if (IsJsonLike(text, contentType)) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("The server returned invalid JSON.");
    }
  }

  if (contentType.includes("text/html")) {
    throw new Error(
      "The server returned HTML instead of JSON. Check that the API route is pointing at the backend."
    );
  }

  if (!response.ok) {
    return { error: text };
  }

  throw new Error("The server returned a non-JSON response.");
}

async function FetchJsonOnce(url, options) {
  const response = await fetch(url, BuildRequestOptions(options));
  const data = await ReadJson(response);

  if (response.status === 401) {
    ClearStoredAuth();
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? data.error
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

export async function FetchJson(url, options) {
  const requestUrls = await BuildRequestUrls(url);
  console.log("Attempting request to:", requestUrls);

  let lastError = null;

  for (let index = 0; index < requestUrls.length; index += 1) {
    const requestUrl = requestUrls[index];

    try {
      return await FetchJsonOnce(requestUrl, options);
    } catch (caughtError) {
      const error = NormalizeRequestError(caughtError);
      lastError = error;

      const canRetry =
        index === 0 &&
        requestUrls.length > 1 &&
        ShouldRetryAgainstBackend(caughtError);

      if (!canRetry) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Request failed.");
}
