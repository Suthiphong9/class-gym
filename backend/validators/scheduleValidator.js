const AppError = require("../errors/AppError")

const validateCreateSchedule = (req,res,next) => {
    const { class_id, schedule_date, start_time, end_time} = req.body;

    const classId = Number(class_id);

    if(!Number.isInteger(classId) || classId <=0) {
        throw new AppError(
            "Invalid class ID"
        )
    }

    if (!schedule_date) {
        throw new AppError(
            "Schedule date is required",
            400
        )
    }

    if (!start_time) {
        throw new AppError(
            "Start time is required",
            400
        )
    }

    if (!end_time) {
        throw new AppError(
            "End time is required",
            400
        );
    }
    next();
    
}

const validateScheduleId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(
            "Invalid schedule ID",
            400
        );
    }

    next();
};


const validateUpdateSchedule = (req, res, next) => {
    const {
        class_id,
        schedule_date,
        start_time,
        end_time
    } = req.body;

    const classId = Number(class_id);

    if (!Number.isInteger(classId) || classId <= 0) {
        throw new AppError(
            "Invalid class ID",
            400
        );
    }

    if (!schedule_date) {
        throw new AppError(
            "Schedule date is required",
            400
        );
    }

    if (!start_time) {
        throw new AppError(
            "Start time is required",
            400
        );
    }

    if (!end_time) {
        throw new AppError(
            "End time is required",
            400
        );
    }

    next();
};

module.exports = {
    validateCreateSchedule,
    validateScheduleId,
    validateUpdateSchedule
};