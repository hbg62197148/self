async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    let errorMessage = `请求失败：${response.status}`;

    try {
      const payload = await response.json();
      errorMessage = payload.message ?? errorMessage;
    } catch {}

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function fetchProfile() {
  const payload = await requestJson("/api/profile");
  return payload.data;
}

export async function fetchDraftProfile() {
  const payload = await requestJson("/api/admin/profile/draft");
  return payload.data;
}

export async function saveDraftProfile(profile) {
  const payload = await requestJson("/api/admin/profile/draft", {
    method: "PUT",
    body: JSON.stringify(profile)
  });

  return payload.data;
}

export async function publishProfile(profile) {
  const payload = await requestJson("/api/admin/profile/publish", {
    method: "POST",
    body: JSON.stringify(profile)
  });

  return payload.data;
}

export async function fetchProfileVersions() {
  const payload = await requestJson("/api/admin/profile/versions");
  return payload.data;
}