import { db } from "../db.js";
import { defaultProfile } from "../../src/data/profile.js";

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

function now() {
  return new Date().toISOString();
}

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

function normalizeProfile(profile, options = {}) {
  const { touch = false } = options;
  const mergedProfile = mergeTemplate(cloneContent(defaultProfile), profile);

  return {
    ...mergedProfile,
    meta: {
      ...(mergedProfile.meta ?? {}),
      updatedAt: touch ? now() : mergedProfile.meta?.updatedAt ?? now()
    }
  };
}

function ensureSeedProfile() {
  const exists = db.prepare("SELECT id FROM profile_versions LIMIT 1").get();

  if (exists) return;

  const profile = normalizeProfile(cloneContent(defaultProfile), { touch: true });

  db.prepare(`
    INSERT INTO profile_versions (status, content, created_at, updated_at, published_at)
    VALUES ('published', ?, ?, ?, ?)
  `).run(JSON.stringify(profile), now(), now(), now());
}

export function getPublishedProfile() {
  ensureSeedProfile();

  const row = db
    .prepare("SELECT content FROM profile_versions WHERE status = 'published' ORDER BY id DESC LIMIT 1")
    .get();

  return row ? normalizeProfile(JSON.parse(row.content)) : normalizeProfile(defaultProfile);
}

export function getDraftProfile() {
  ensureSeedProfile();

  const draftRow = db
    .prepare("SELECT id, content FROM profile_versions WHERE status = 'draft' ORDER BY id DESC LIMIT 1")
    .get();
  const publishedRow = db
    .prepare("SELECT id, content FROM profile_versions WHERE status = 'published' ORDER BY id DESC LIMIT 1")
    .get();

  if (draftRow && (!publishedRow || draftRow.id > publishedRow.id)) {
    return normalizeProfile(JSON.parse(draftRow.content));
  }

  return publishedRow ? normalizeProfile(JSON.parse(publishedRow.content)) : getPublishedProfile();
}

export function saveDraftProfile(profile) {
  const normalizedProfile = normalizeProfile(profile, { touch: true });

  db.prepare(`
    INSERT INTO profile_versions (status, content, created_at, updated_at)
    VALUES ('draft', ?, ?, ?)
  `).run(JSON.stringify(normalizedProfile), now(), now());

  return normalizedProfile;
}

export function publishProfile(profile) {
  const normalizedProfile = normalizeProfile(profile, { touch: true });

  db.prepare(`
    INSERT INTO profile_versions (status, content, created_at, updated_at, published_at)
    VALUES ('published', ?, ?, ?, ?)
  `).run(JSON.stringify(normalizedProfile), now(), now(), now());

  return normalizedProfile;
}

export function listProfileVersions() {
  ensureSeedProfile();

  return db
    .prepare(`
      SELECT id, status, created_at, updated_at, published_at
      FROM profile_versions
      ORDER BY id DESC
      LIMIT 30
    `)
    .all();
}
