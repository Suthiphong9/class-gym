const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/slips");
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const filename = `slip-${Date.now()}${extension}`;

        cb(null, filename)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error("Only image files are allowed")
        )
    }
    cb(null, true)
}

const uploadSlip = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

module.exports = uploadSlip;