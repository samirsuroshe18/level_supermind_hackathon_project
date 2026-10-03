import { Router } from "express";
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { forgotPassword, getMe, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);

//Secure routes
router.route('/logout').get(verifyJwt, logoutUser);
router.route('/me').get(verifyJwt, getMe);


export default router;
