const cloneContent = (value) => JSON.parse(JSON.stringify(value));

function maskEmail(value = "") {
  const [localPart = "", domain = ""] = value.split("@");

  if (!domain) {
    return maskGeneric(value);
  }

  const visiblePrefix = localPart.slice(0, 3);
  return `${visiblePrefix}${"*".repeat(Math.max(localPart.length - visiblePrefix.length, 4))}@${domain}`;
}

function maskPhone(value = "") {
  const digits = value.replace(/\s+/g, "");

  if (digits.length <= 4) {
    return `${digits.slice(0, 1)}***`;
  }

  return `${digits.slice(0, 3)}****${digits.slice(-2)}`;
}

function maskGeneric(value = "") {
  if (value.length <= 2) {
    return `${value.charAt(0)}***`;
  }

  return `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 4, 3))}${value.slice(-2)}`;
}

function maskProtectedContact(item) {
  const nextItem = cloneContent(item);
  nextItem.masked = true;

  if (item.href?.startsWith("mailto:") || item.value.includes("@")) {
    nextItem.value = maskEmail(item.value);
    nextItem.href = "";
    return nextItem;
  }

  if (item.copy) {
    nextItem.value = maskPhone(item.value);
    return nextItem;
  }

  nextItem.value = maskGeneric(item.value);
  nextItem.href = "";
  return nextItem;
}

// 前台公开数据只返回脱敏后的联系方式，降低被直接抓取的风险。
export function sanitizeProfileForPublic(profile) {
  const nextProfile = cloneContent(profile);

  nextProfile.contact.items = nextProfile.contact.items.map((item) =>
    item.protected ? maskProtectedContact(item) : item
  );

  return nextProfile;
}
