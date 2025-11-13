import express from 'express';
import lessonsControllerFactory from '../controllers/lessonsController.mjs';
import authenticateToken from '../middlewares/authMiddleware.mjs'; 

export default function(client, JUDGE0_URL, JUDGE0_API_KEY) {
    const router = express.Router();
    const lessonsController = lessonsControllerFactory(client, JUDGE0_URL, JUDGE0_API_KEY);

    router.post('/', authenticateToken, lessonsController.createLesson);
    router.get('/', authenticateToken, lessonsController.getAllLessons);
    router.get('/:id', authenticateToken, lessonsController.getLesson);
    router.put('/:id', authenticateToken, lessonsController.updateLesson);
    router.delete('/:id', authenticateToken, lessonsController.deleteLesson);
    router.post('/:lessonId/submit', authenticateToken, lessonsController.submitLesson);

    return router;
}
