"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Definición de rutas del módulo Auth
router.post('/register', auth_controller_1.AuthController.register);
router.post('/login', auth_controller_1.AuthController.login);
router.get('/profile', auth_middleware_1.authenticateToken, auth_controller_1.AuthController.profile);
// Futuro: router.post('/login', AuthController.login);
exports.default = router;
