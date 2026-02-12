import express from 'express'
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getOverviewStats,
  getAllUsers,
  getUserEngagement
} from '../controllers/adminController'

const router = express.Router()

router.post('/', createAdmin)
router.get('/', getAllAdmins)
router.get("/overview", getOverviewStats);
router.get("/users",  getAllUsers);
router.get('/engagement', getUserEngagement);
router.get("/:id",getAdminById)
router.put('/:id', updateAdmin)
router.delete('/:id', deleteAdmin)



export default router
