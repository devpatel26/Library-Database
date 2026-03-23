const localApiOrigin = "http://localhost:3000";

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
  localStorage.setItem(key, JSON.stringify(value));
}

function BuildAuthenticatedHeaders(headers) {
  const nextHeaders = new Headers(headers ?? {});

  if (typeof window === "undefined") {
    return nextHeaders;
  }

  const user = ReadStoredJson("user");

  if (!user) {
    return nextHeaders;
  }

  if (user.user_type) {
    nextHeaders.set("x-user-type", String(user.user_type));
  }

  if (user.patron_id != null) {
    nextHeaders.set("x-patron-id", String(user.patron_id));
  }

  if (user.staff_id != null) {
    nextHeaders.set("x-staff-id", String(user.staff_id));
  }

  if (user.role != null) {
    nextHeaders.set("x-role-code", String(user.role));
  }

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
  const requestUrls = BuildRequestUrls(url);
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
