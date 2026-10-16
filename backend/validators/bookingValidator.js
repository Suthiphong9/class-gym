const AppError = require("../errors/AppError");

const validateCreateBooking = (req,res,next) => {
    const {schedule_id}= req.body;

    const scheduleId = Number(schedule_id);

    if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
        throw new AppError(
            "Invalid schedule ID",
            400
        )
    }

    next();
}

const validateBookingId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(
            "Invalid booking ID",
            400
        );
    }

    next();
};

const validateBookingStatus = (req, res, next) => {

    const { status } = req.body;

    if (!status) {
        throw new AppError(
            "Status is required",
            400
        );
    }

    const allowedStatuses = [
        "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new AppError(
            "Invalid booking status",
            400
        );
    }

    next();
};


module.exports = {
    validateCreateBooking,
    validateBookingId,
    validateBookingStatus
};