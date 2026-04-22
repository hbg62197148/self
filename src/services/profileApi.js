const PROFILE_ENDPOINT = "/api/profile";

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json();
}

export async function fetchProfile() {
  const payload = await requestJson(PROFILE_ENDPOINT);
  return payload.data;
}

export async function saveProfile(profile) {
  const payload = await requestJson(PROFILE_ENDPOINT, {
    method: "PUT",
    body: JSON.stringify(profile)
  });

  return payload.data;
}
