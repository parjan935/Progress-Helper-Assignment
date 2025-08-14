import { Router } from "express"
import { HelperControllers } from "../controllers/helper.contoller"

const router = Router()

import multer from "multer"
import { fileUploadMiddleware } from "../middlewares/file-upload"
const upload = multer({ storage: multer.memoryStorage() })

const helperController = new HelperControllers()

router.get('/', helperController.getAllHelpers)
router.post('/', fileUploadMiddleware, helperController.createHelper)
router.get('/:id', helperController.getHelperById)
router.delete('/:id', helperController.deleteHelper)
router.put('/:id', fileUploadMiddleware, helperController.updateHelper)

router.post('/getByFilter', helperController.getHelpersByFilters)

export default router

