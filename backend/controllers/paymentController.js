const AppError = require("../errors/AppError");
const paymentService = require("../services/paymentService");
const { successResponse } = require("../utils/response");
const path = require("path");

const createPayment = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const {
            order_id,
            payment_method
        } = req.body;

        const orderId = Number(order_id);

        const slipUrl = req.file
            ? `/uploads/slips/${req.file.filename}`
            : null;

        const payment =
            await paymentService.createPayment(
                userId,
                orderId,
                payment_method,
                slipUrl
            );

        return successResponse(
            res,
            201,
            "Payment submitted successfully",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const getAllPaymentsForAdmin = async (
    req,
    res,
    next
) => {
    try {
        const payments =
            await paymentService.getAllPaymentsForAdmin();

        return successResponse(
            res,
            200,
            "Payments retrieved successfully",
            payments
        );
    } catch (error) {
        next(error);
    }
};

const getPaymentByIdForAdmin = async (
    req,
    res,
    next
) => {
    try {
        const paymentId =
            Number(req.params.id);

        const payment =
            await paymentService.getPaymentByIdForAdmin(
                paymentId
            );

        return successResponse(
            res,
            200,
            "Payment retrieved successfully",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const updatePaymentStatus = async (
    req,
    res,
    next
) => {
    try {
        const paymentId =
            Number(req.params.id);

        const { status } = req.body;

        const payment =
            await paymentService.updatePaymentStatus(
                paymentId,
                status
            );

        return successResponse(
            res,
            200,
            "Payment status updated successfully",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const getPaymentsByUser = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const payments =
            await paymentService.getPaymentsByUserId(
                userId
            );

        return successResponse(
            res,
            200,
            "Payments retrieved successfully",
            payments
        );
    } catch (error) {
        next(error);
    }
};

const getPaymentByUser = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const paymentId =
            Number(req.params.id);

        const payment =
            await paymentService.getPaymentById(
                paymentId,
                userId
            );

        return successResponse(
            res,
            200,
            "Payment retrieved successfully",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const getPaymentSlip = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const paymentId =
            Number(req.params.id);

        const slipUrl =
            await paymentService.getPaymentSlipPath(
                paymentId,
                userId
            );

        const relativePath =
            slipUrl.replace(/^\/+/, "");

        const uploadsDirectory =
            path.resolve(
                process.cwd(),
                "uploads",
                "slips"
            );

        const filePath =
            path.resolve(
                process.cwd(),
                relativePath
            );

        if (
            !filePath.startsWith(
                uploadsDirectory + path.sep
            )
        ) {
            return next(
                new Error("Invalid file path")
            );
        }

        return res.sendFile(
            filePath,
            (error) => {
                if (error) {
                    console.error(error);

                    if (!res.headersSent) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Payment slip file not found"
                        });
                    }
                }
            }
        );
    } catch (error) {
        next(error);
    }
};

const getPaymentSlipForAdmin = async (
    req,
    res,
    next
) => {
    try {
        const paymentId =
            Number(req.params.id);

        const slipUrl =
            await paymentService
                .getPaymentSlipPathForAdmin(
                    paymentId
                );

        const relativePath =
            slipUrl.replace(/^\/+/, "");

        const uploadsDirectory =
            path.resolve(
                process.cwd(),
                "uploads",
                "slips"
            );

        const filePath =
            path.resolve(
                process.cwd(),
                relativePath
            );

        if (
            !filePath.startsWith(
                uploadsDirectory + path.sep
            )
        ) {
            return next(
    new AppError(
        "Invalid file path",
        400
    )
);
        }

        return res.sendFile(
            filePath,
            (error) => {
                if (error) {
                    console.error(error);

                    if (!res.headersSent) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Payment slip file not found"
                        });
                    }
                }
            }
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPayment,
    getAllPaymentsForAdmin,
    getPaymentByIdForAdmin,
    updatePaymentStatus,
    getPaymentsByUser,
    getPaymentByUser,
    getPaymentSlip,
    getPaymentSlipForAdmin
};