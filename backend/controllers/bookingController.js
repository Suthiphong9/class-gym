const bookingService = require("../services/bookingService");


const createBooking = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const {
            schedule_id
        } = req.body;

        const booking =
            await bookingService.createBooking(
                userId,
                Number(schedule_id)
            );

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });

    } catch (error) {

        next(error);

    }
};

const getMyBookings = async (req,res,next) => {
    try{
        const userId = req.user.id;
        const bookings = await bookingService.getMyBookings(userId);

        res.status(200).json({
            success: true,
            bookings
        })
    }catch(error){
        next(error)
    }
}

const getBookingById = async (req,res,next) => {
    try{
        const bookingId = Number(req.params.id);
        const userId = req.user.id;

        const booking = await bookingService.getBookingById(bookingId,userId)

        res.status(200).json({
            success: true,
            booking
        })
    }catch(error) {
        next(error)
    }
}

const cancelBooking = async (req,res,next) => {
    try {
        const bookingId = Number(req.params.id);
        const userId = req.user.id;

        await bookingService.cancelBooking(bookingId,userId)

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        })
    } catch(error){
        next(error)
    }
}

const getAllBookings = async (req, res, next) => {
    try {

        const bookings =
            await bookingService.getAllBookings();

        res.status(200).json({
            success: true,
            bookings
        });

    } catch (error) {
        next(error);
    }
};


const getBookingByIdForAdmin = async (req, res, next) => {

    try {

        const bookingId = Number(req.params.id);

        const booking =
            await bookingService.getBookingByIdForAdmin(
                bookingId
            );

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {

        next(error);

    }
};

const updateBookingStatus = async (req, res, next) => {

    try {

        const bookingId = Number(req.params.id);

        const { status } = req.body;

        await bookingService.updateBookingStatus(
            bookingId,
            status
        );

        res.status(200).json({
            success: true,
            message: "Booking status updated successfully"
        });

    } catch (error) {

        next(error);

    }
};


module.exports = {
    createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings, getBookingByIdForAdmin, updateBookingStatus
};