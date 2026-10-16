const successResponse = (
    res,
    statusCode,
    message,
    data = null
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (
    res,
    statusCode,
    message
) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

const paginationResponse = (
    res,
    statusCode,
    message,
    data,
    pagination
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginationResponse
};