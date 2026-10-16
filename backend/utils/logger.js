const winston = require("winston");

const logger = winston.createLogger({
    level: "info",

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({
            stack: true
        }),
        winston.format.json()
    ),

    transports: [
        // แสดงใน Terminal / Docker logs
        new winston.transports.Console(),

        // เก็บทุก log ตั้งแต่ info ขึ้นไป
        new winston.transports.File({
            filename: "logs/combined.log"
        }),

        // เก็บเฉพาะ error
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error"
        })
    ]
});

module.exports = logger;