import { Router } from 'express';
const router = new Router()
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import UserController from '../controller/user.controller.js'

router.use(authMiddleware);

router.get('/:id', UserController.getOneUser);
router.get('/', adminMiddleware, UserController.getUser);
router.patch('/:id/block', UserController.blockUser);
router.patch('/:id/activate', adminMiddleware, UserController.activateUser)

export const userRouter = router