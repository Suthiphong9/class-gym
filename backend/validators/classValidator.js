const AppError = require("../errors/AppError");

const validateCreateClass = (req,res,next) => {
    const {name, instructor_id, capacity,duration_minutes} = req.body;

    if (!name) {
        throw new AppError(
            "Class name is required",
            400
        )
    }

    const instructorId = Number(instructor_id);

    if (!Number.isInteger(instructorId) || instructorId <= 0) {
        throw new AppError(
            "Invalid instructor ID",
            400
        )
    }
    const classCapacity = Number(capacity);

    if (!Number.isInteger(classCapacity) || classCapacity <= 0) {
        throw new AppError(
            "Capacity must be a positive integer",
            400
        )
    }

    const duration = Number(duration_minutes);

    if (!Number.isInteger(duration) || duration <= 0) {
        throw new AppError(
            "Duration must be a positive integer",
            400
        )
    } 
    next();
}

const validateClassId = (req,res,next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError(
            "Invalid class ID",
            400
        )
    }

    next()
}

const validateUpdateClass = (req,res,next) => {
    const {name, instructor_id, capacity, duration_minutes} = req.body;

    if (!name) {
        throw new AppError(
            "Class name is required",
            400
        )
    }

    const instructorId = Number(instructor_id);

    if (!Number.isInteger(instructorId) || instructorId <= 0) {
        throw new AppError(
            "Invalid instructor ID",
            400
        )
    }

    const classCapacity = Number(capacity);

    if (!Number.isInteger(classCapacity) || classCapacity <= 0) {
        throw new AppError(
            "Capacity must be a positive integer",
            400
        )
    }

    const duration = Number(duration_minutes);

    if (!Number.isInteger(duration) || duration <= 0) {
        throw new AppError(
            "Duration must be a positive integer",
            400
        )
    }
    next()
}

module.exports = {validateCreateClass, validateClassId, validateUpdateClass}