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
    } catch {
      // 登录接口没有返回 JSON 时，保留默认错误文案即可。
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// 登录成功后，服务端会通过 Cookie 记录后台会话。
export async function loginAdmin(credentials) {
  const payload = await requestJson("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

  return payload.data;
}

export async function fetchAdminSession() {
  const payload = await requestJson("/api/admin/session");
  return payload.data;
}

export async function logoutAdmin() {
  await requestJson("/api/admin/logout", {
    method: "POST"
  });
}
