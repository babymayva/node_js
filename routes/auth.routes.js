import { Router } from 'express';
import AuthController from '../controller/auth.controller.js';
const router = Router();

router.post('/registred', AuthController.createUser)
router.post('/login', AuthController.loginUser)
export const authRouter = router