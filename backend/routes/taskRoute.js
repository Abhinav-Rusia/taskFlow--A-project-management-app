import express from 'express';
import authMiddleware from '../middleware/auth.js'; // Import default export
import {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getAssignedTasks,
  getCreatedTasks,
} from '../controllers/taskController.js';

const router = express.Router();

// Task CRUD routes - use authMiddleware instead of protect
router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getAllTasks);
router.get('/my', authMiddleware, getMyTasks);
router.get('/assigned', authMiddleware, getAssignedTasks);
router.get('/created', authMiddleware, getCreatedTasks);
router.get('/project/:projectId', authMiddleware, getTasksByProject);
router.get('/:id', authMiddleware, getTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);



export default router;
