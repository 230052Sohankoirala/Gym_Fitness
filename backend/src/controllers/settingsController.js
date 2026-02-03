// controllers/settingsController.js
import Settings from "../models/Settings.js";

const DEFAULT_SETTINGS = {
  organization: {
    name: "FitTrack Gym",
    email: "admin@fittrack.com",
    phone: "",
    timezone: "Australia/Sydney",
    maintenanceMode: false,
  },
  trainers: {
    requireVerification: true,
    showRatings: true,
    maxClientsPerTrainer: 50,
  },
  classes: {
    defaultDurationMins: 60,
    cancelWindowHours: 12,
    autoWaitlist: true,
    maxCapacity: 20,
  },
  billing: {
    currency: "AUD",
    taxRatePercent: 10,
    gateway: "Stripe",
    invoicesFrom: "billing@fittrack.com",
  },
  security: {
    enforce2FA: false,
    passwordMinLength: 8,
    lockoutThreshold: 5,
    ipAllowlist: "",
  },
  notifications: {
    emailFrom: "noreply@fittrack.com",
    provider: "SendGrid",
    transactionalOn: true,
    marketingOn: false,
    smsEnabled: false,
  },
  backups: {
    schedule: "Daily",
    retentionDays: 14,
    autoDownload: false,
  },
};

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

// safe deep merge
const deepMerge = (target, source) => {
  const out = { ...(target || {}) };
  if (!isObject(source)) return out;

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = out[key];
    if (isObject(srcVal) && isObject(tgtVal)) out[key] = deepMerge(tgtVal, srcVal);
    else out[key] = srcVal;
  }
  return out;
};

const validateSettings = (payload = {}) => {
  const errors = [];

  const n = (v) => Number(v);

  if (payload?.trainers?.maxClientsPerTrainer !== undefined) {
    const v = n(payload.trainers.maxClientsPerTrainer);
    if (!Number.isFinite(v) || v < 1 || v > 500) errors.push("trainers.maxClientsPerTrainer must be 1–500");
  }

  if (payload?.classes?.defaultDurationMins !== undefined) {
    const v = n(payload.classes.defaultDurationMins);
    if (!Number.isFinite(v) || v < 15 || v > 240) errors.push("classes.defaultDurationMins must be 15–240");
  }

  if (payload?.classes?.cancelWindowHours !== undefined) {
    const v = n(payload.classes.cancelWindowHours);
    if (!Number.isFinite(v) || v < 0 || v > 168) errors.push("classes.cancelWindowHours must be 0–168");
  }

  if (payload?.classes?.maxCapacity !== undefined) {
    const v = n(payload.classes.maxCapacity);
    if (!Number.isFinite(v) || v < 1 || v > 500) errors.push("classes.maxCapacity must be 1–500");
  }

  if (payload?.billing?.taxRatePercent !== undefined) {
    const v = n(payload.billing.taxRatePercent);
    if (!Number.isFinite(v) || v < 0 || v > 30) errors.push("billing.taxRatePercent must be 0–30");
  }

  if (payload?.security?.passwordMinLength !== undefined) {
    const v = n(payload.security.passwordMinLength);
    if (!Number.isFinite(v) || v < 6 || v > 64) errors.push("security.passwordMinLength must be 6–64");
  }

  if (payload?.security?.lockoutThreshold !== undefined) {
    const v = n(payload.security.lockoutThreshold);
    if (!Number.isFinite(v) || v < 1 || v > 25) errors.push("security.lockoutThreshold must be 1–25");
  }

  return errors;
};

const ensureSettingsDoc = async () => {
  let doc = await Settings.findOne();
  if (!doc) {
    doc = await Settings.create(DEFAULT_SETTINGS);
    return doc;
  }

  // auto-fill missing keys if you deploy new fields later
  const merged = deepMerge(DEFAULT_SETTINGS, doc.toObject());
  doc.set(merged);
  await doc.save();
  return doc;
};

/**
 * GET /api/settings  (admin)
 */
export const getSettings = async (_req, res) => {
  try {
    const settings = await ensureSettingsDoc();
    return res.json(settings);
  } catch (err) {
    console.error("getSettings:", err);
    return res.status(500).json({ message: "Failed to load settings" });
  }
};

/**
 * GET /api/settings/public  (optional public)
 * Only return safe fields
 */
export const getPublicSettings = async (_req, res) => {
  try {
    const settings = await ensureSettingsDoc();
    return res.json({
      organization: {
        name: settings.organization?.name || DEFAULT_SETTINGS.organization.name,
        timezone: settings.organization?.timezone || DEFAULT_SETTINGS.organization.timezone,
        maintenanceMode: !!settings.organization?.maintenanceMode,
      },
    });
  } catch (err) {
    console.error("getPublicSettings:", err);
    return res.status(500).json({ message: "Failed to load public settings" });
  }
};

/**
 * PUT /api/settings  (admin)
 * body: { organization, trainers, classes, billing, security, notifications, backups }
 */
export const updateSettings = async (req, res) => {
  try {
    const incoming = req.body || {};
    const errors = validateSettings(incoming);
    if (errors.length) return res.status(400).json({ message: "Invalid settings", errors });

    const settings = await ensureSettingsDoc();

    // merge incoming over existing
    const updated = deepMerge(settings.toObject(), incoming);

    settings.set(updated);
    settings.updatedBy = req.user?._id || null;

    await settings.save();

    return res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    console.error("updateSettings:", err);
    return res.status(500).json({ message: "Failed to update settings" });
  }
};

/**
 * PATCH /api/settings/:section  (admin)
 * section: organization | trainers | classes | billing | security | notifications | backups
 * body: only that section
 */
export const updateSettingsSection = async (req, res) => {
  try {
    const allowed = ["organization", "trainers", "classes", "billing", "security", "notifications", "backups"];
    const { section } = req.params;

    if (!allowed.includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    const incoming = { [section]: req.body || {} };
    const errors = validateSettings(incoming);
    if (errors.length) return res.status(400).json({ message: "Invalid settings", errors });

    const settings = await ensureSettingsDoc();

    settings[section] = deepMerge(settings[section], incoming[section]);
    settings.updatedBy = req.user?._id || null;

    await settings.save();

    return res.json({ message: `Updated ${section}`, settings });
  } catch (err) {
    console.error("updateSettingsSection:", err);
    return res.status(500).json({ message: "Failed to update section" });
  }
};

/**
 * POST /api/settings/reset (admin)
 */
export const resetSettings = async (req, res) => {
  try {
    const settings = await ensureSettingsDoc();

    settings.set(DEFAULT_SETTINGS);
    settings.updatedBy = req.user?._id || null;
    await settings.save();

    return res.json({ message: "Settings reset to defaults", settings });
  } catch (err) {
    console.error("resetSettings:", err);
    return res.status(500).json({ message: "Failed to reset settings" });
  }
};

/**
 * GET /api/settings/meta (admin)
 */
export const getSettingsMeta = async (_req, res) => {
  try {
    const settings = await ensureSettingsDoc();
    return res.json({
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy || null,
    });
  } catch (err) {
    console.error("getSettingsMeta:", err);
    return res.status(500).json({ message: "Failed to fetch settings meta" });
  }
};
