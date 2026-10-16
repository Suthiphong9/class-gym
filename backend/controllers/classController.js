const classService = require("../services/classService")

const createClass = async (req, res, next) => {
    try {
        const classData = await classService.createClass(req.body);

        return successResponse(
            res,
            201,
            "Class created successfully",
            classData
        );
    }catch(error) {
        next(error)
    }
}

const getAllClasses = async (req,res,next) => {
    try{
        const classes = await classService.getAllClasses();

        return successResponse(
            res,
            200,
            "Classes retrieved successfully",
            classes
        );
    }catch(error) {
        next(error)
    }
}

const getClassById = async (req,res,next) => {
    try{
        const id = Number(req.params.id)

        const classData = await classService.getClassById(id);

        return successResponse(
            res,
            200,
            "Class retrieved successfully",
            classData
        );
    }catch(error) {
        next(error)
    }
}

const updateClass = async (req,res,next) => {
    try{
        const id = Number(req.params.id)

        const classData = await classService.updateClass(id,req.body)

        return successResponse(
            res,
            200,
            "Class updated successfully",
            classData
        );
    }catch(error){
        next(error)
    }
}

const deleteClass = async (req,res,next) => {
    try{
        const id = Number(req.params.id)

        await classService.deleteClass(id);

        return successResponse(
            res,
            200,
            "Class deleted successfully"
        );
    }catch(error) {
        next(error)
    }
}


module.exports = {createClass, getAllClasses, getClassById, updateClass, deleteClass};