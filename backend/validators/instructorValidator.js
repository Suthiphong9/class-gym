const AppError = require("../errors/AppError");

const validateCreateInstructor = (req,res,next) => {
    const {name, bio, specialization} = req.body;

    if(!name || !specialization) {
        throw new AppError(
            "Name and specialization are required",
            400
        )
    };
    next();
}

const validateInstructorId = (req,res,next) => {
    const id = Number(req.params.id);

    if(!Number.isInteger(id) || id <= 0) {
        throw new AppError(
            "Invalid instructor ID",
            400
        )
    }

    next();
}

const validateUpdateInstructor = (req,res,next) => {
    const {name, specialization} = req.body;

    if (!name || !specialization) {
        throw new AppError(
            "Name and specialization are required",
            400
        )
    }

    next();
}

module.exports = {validateCreateInstructor, validateInstructorId, validateUpdateInstructor}