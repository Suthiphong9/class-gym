const instructorService = require("../services/instructorService");
const {
    successResponse
} = require("../utils/response");

const createInstructor = async (req, res, next) => {
    try {

        const instructor = await instructorService.createInstructor(req.body)

         return successResponse(
            res,
            201,
            "Instructor created successfully",
            instructor
        );
    }catch(error){
        next(error);
    }
}

const getAllInstructors = async (req,res,next) => {
    try{
        const instructors = await instructorService.getAllInstructors();
        
        return successResponse(
            res,
            200,
            "Instructors retrieved successfully",
            instructors
        );
    }catch(error){
        next(error);
    }
}

const getInstructorById = async (req,res,next) => {
    try {
        const id = Number(req.params.id);

        const instructor = await instructorService.getInstructorById(id)

        return successResponse(
            res,
            200,
            "Instructor retrieved successfully",
            instructor
        );
    }catch(error){
        next(error)
    }
}

const updateInstructor = async (req,res,next) => {
    try {
        const id = Number(req.params.id)

        const instructor = await instructorService.updateInstructor(id,req.body)

        return successResponse(
            res,
            200,
            "Instructor updated successfully",
            instructor
        );
    }catch(error) {
        next(error)
    }
}

const deleteInstructor = async (req,res,next) => {
    try{
        const id = Number(req.params.id)

        await instructorService.deleteInstructor(id)

        return successResponse(
            res,
            200,
            "Instructor deleted successfully"
        );
    }catch(error){
        next(error)
    }
}
module.exports = {createInstructor, getAllInstructors, getInstructorById, updateInstructor, deleteInstructor}