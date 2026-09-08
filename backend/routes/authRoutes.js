const express = require("express")
const routes = express.Router();
const authControlloer = require("../controllers/authController");

routes.post("/register",authControlloer.register)
routes.post("/login", authControlloer.login)
module.exports = routes;