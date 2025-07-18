import express from 'express';
import {
  getAllNotificationsForUser,
  markNotificationAsRead,
  addNotification,
  deleteNotification,
  getAllNotifications,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/:user_id', getAllNotificationsForUser);
router.put('/read/:id', markNotificationAsRead);
router.post('/', addNotification);
router.get("/",getAllNotifications)
router.delete('/:id', deleteNotification);

export default router;
