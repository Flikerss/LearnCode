import express from 'express';
import usersController from '../controllers/userController.mjs';
import authenticateToken from '../middlewares/authMiddleware.mjs'; 

const router = express.Router();

router.post('/', usersController.register);
router.post('/login', usersController.login);
router.get('/', authenticateToken, usersController.getAll);
router.put('/:id/progress/:lessonId', authenticateToken, usersController.updateProgress);
router.put('/:id', authenticateToken, usersController.updateName);

export default router;
