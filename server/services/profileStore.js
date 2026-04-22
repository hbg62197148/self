import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultProfile } from "../../src/data/profile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const profileFile = path.join(dataDir, "profile.json");

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

function mergeTemplate(template, input) {
  if (Array.isArray(template)) {
    return Array.isArray(input) ? input : cloneContent(template);
  }

  if (template && typeof template === "object") {
    const nextValue = {};
    const source = input && typeof input === "object" ? input : {};

    Object.keys(template).forEach((key) => {
      nextValue[key] = mergeTemplate(template[key], source[key]);
    });

    Object.keys(source).forEach((key) => {
      if (!(key in nextValue)) {
        nextValue[key] = source[key];
      }
    });

    return nextValue;
  }

  return input === undefined ? template : input;
}

function attachMeta(profile) {
  return {
    ...profile,
    meta: {
      ...(profile.meta ?? {}),
      updatedAt: new Date().toISOString()
    }
  };
}

async function ensureProfileFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await access(profileFile);
  } catch {
    const seededProfile = attachMeta(cloneContent(defaultProfile));
    await writeFile(profileFile, JSON.stringify(seededProfile, null, 2), "utf8");
  }
}

export async function readProfile() {
  await ensureProfileFile();

  try {
    const raw = await readFile(profileFile, "utf8");
    const parsed = JSON.parse(raw);
    return mergeTemplate(attachMeta(cloneContent(defaultProfile)), parsed);
  } catch {
    const seededProfile = attachMeta(cloneContent(defaultProfile));
    await writeFile(profileFile, JSON.stringify(seededProfile, null, 2), "utf8");
    return seededProfile;
  }
}

export async function writeProfile(nextProfile) {
  await ensureProfileFile();

  const normalizedProfile = attachMeta(mergeTemplate(cloneContent(defaultProfile), nextProfile));
  await writeFile(profileFile, JSON.stringify(normalizedProfile, null, 2), "utf8");
  return normalizedProfile;
}
