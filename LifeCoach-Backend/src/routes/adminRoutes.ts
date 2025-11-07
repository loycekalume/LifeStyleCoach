import express from 'express'
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getOverviewStats,
  getAllUsers
} from '../controllers/adminController'

const router = express.Router()

router.get('/', getAllAdmins)
router.get("/overview", getOverviewStats);
router.get("/users",  getAllUsers);
router.get("/:id",getAdminById)
router.post('/', createAdmin)
router.put('/:id', updateAdmin)
router.delete('/:id', deleteAdmin)



export default router
