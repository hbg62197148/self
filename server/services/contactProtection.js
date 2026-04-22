import { randomUUID } from "node:crypto";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const challenges = new Map();

// 验证码只保留短时间，避免旧挑战被重复使用。
function cleanupExpiredChallenges() {
  const now = Date.now();

  Array.from(challenges.entries()).forEach(([challengeId, challenge]) => {
    if (challenge.expiresAt <= now) {
      challenges.delete(challengeId);
    }
  });
}

function findProtectedContact(profile, label) {
  return profile.contact.items.find((item) => item.label === label && item.protected);
}

// 点击受保护联系方式时，先生成一次服务端验证码挑战。
export function createContactChallenge(profile, label) {
  cleanupExpiredChallenges();

  const targetItem = findProtectedContact(profile, label);

  if (!targetItem) {
    return null;
  }

  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;
  const challengeId = randomUUID();

  challenges.set(challengeId, {
    label,
    answer: String(left + right),
    expiresAt: Date.now() + CHALLENGE_TTL_MS
  });

  return {
    challengeId,
    prompt: `${left} + ${right} = ?`
  };
}

export function verifyContactChallenge(profile, challengeId, label, answer) {
  cleanupExpiredChallenges();

  const challenge = challenges.get(challengeId);

  if (!challenge || challenge.label !== label) {
    return {
      success: false,
      message: "验证码已失效，请重新获取。"
    };
  }

  if (String(answer).trim() !== challenge.answer) {
    return {
      success: false,
      message: "验证码错误，请重新输入。"
    };
  }

  challenges.delete(challengeId);

  const targetItem = findProtectedContact(profile, label);

  if (!targetItem) {
    return {
      success: false,
      message: "目标联系方式不存在。"
    };
  }

  return {
    success: true,
    item: targetItem
  };
}
