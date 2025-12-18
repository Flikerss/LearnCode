import express from 'express';
import lessonsControllerFactory from '../controllers/lessonsController.mjs';
import authenticateToken, { optionalAuthenticateToken } from '../middlewares/authMiddleware.mjs'; 

export default function(client, JUDGE0_URL, JUDGE0_API_KEY) {
    const router = express.Router();
    const lessonsController = lessonsControllerFactory(client, JUDGE0_URL, JUDGE0_API_KEY);

    router.get('/', optionalAuthenticateToken, lessonsController.getAllLessons);
    router.get('/:id', optionalAuthenticateToken, lessonsController.getLesson);
    router.get('/:lessonId/content', optionalAuthenticateToken, lessonsController.getLessonContent);
    
    router.post('/', authenticateToken, lessonsController.createLesson);
    router.put('/:id', authenticateToken, lessonsController.updateLesson);
    router.delete('/:id', authenticateToken, lessonsController.deleteLesson);
    router.post('/:lessonId/submit', authenticateToken, lessonsController.submitLesson);
    router.post('/:lessonId/completion', authenticateToken, lessonsController.markLessonCompleted);

    return router;
}
