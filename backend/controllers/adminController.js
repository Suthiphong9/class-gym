const getAdminDashboard = async (req,res) => {
    res.status(200).json({
        message: "Welcome to admin dashboard",
        user: req.user
    })
}

module.exports = {getAdminDashboard}