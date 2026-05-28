import multer from "multer";
import path from "path";
import fs from "fs";

const avatarsDir = path.join(process.cwd(), "uploads", "avatars");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();

    const safeName = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}${ext}`;

    cb(null, safeName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp"];

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const ext = path.extname(file.originalname || "").toLowerCase();

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error("Only JPG, JPEG, PNG, GIF, and WEBP images are allowed"),
    false
  );
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});