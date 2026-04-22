async function requestJson(url, options = {}) {
  const response = await fetch(url, {
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
    } catch {
      // 接口没有返回 JSON 时，保留默认错误文案即可。
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function createContactChallenge(label) {
  const payload = await requestJson("/api/contact/challenge", {
    method: "POST",
    body: JSON.stringify({ label })
  });

  return payload.data;
}

export async function verifyProtectedContact(payload) {
  const response = await requestJson("/api/contact/access", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return response.data;
}
