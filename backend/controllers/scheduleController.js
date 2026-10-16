const scheduleService = require("../services/scheduleService");
const { successResponse } = require("../utils/response");

// CREATE
const createSchedule = async (req, res, next) => {
    try {

        const schedule =
            await scheduleService.createSchedule(
                req.body
            );

        return successResponse(
            res,
            201,
            "Schedule created successfully",
            schedule
        );

    } catch (error) {
        next(error);
    }
};


// GET ALL
const getAllSchedules = async (req, res, next) => {
    try {

        const schedules =
            await scheduleService.getAllSchedules();

        return successResponse(
            res,
            200,
            "Schedules retrieved successfully",
            schedules
        );

    } catch (error) {
        next(error);
    }
};


// GET BY ID
const getScheduleById = async (req, res, next) => {
    try {

        const id = Number(req.params.id);

        const schedule =
            await scheduleService.getScheduleById(id);

        return successResponse(
            res,
            200,
            "Schedule retrieved successfully",
            schedule
        );

    } catch (error) {
        next(error);
    }
};


// UPDATE
const updateSchedule = async (req, res, next) => {
    try {

        const id = Number(req.params.id);

        const schedule =
            await scheduleService.updateSchedule(
                id,
                req.body
            );

        return successResponse(
            res,
            200,
            "Schedule updated successfully",
            schedule
        );

    } catch (error) {
        next(error);
    }
};


// DELETE
const deleteSchedule = async (req, res, next) => {
    try {

        const id = Number(req.params.id);

        await scheduleService.deleteSchedule(id);

        return successResponse(
            res,
            200,
            "Schedule deleted successfully"
        );

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
};