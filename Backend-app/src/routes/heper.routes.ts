import { Router } from "express"
import { HelperControllers } from "../controllers/helper.contoller"

const router = Router()

import multer from "multer"
import { fileUploadMiddleware } from "../middlewares/file-upload"
const upload = multer({ storage: multer.memoryStorage() })

const helperController = new HelperControllers()

router.post('/getHelpers', helperController.getNextHelpers)

router.post('/', fileUploadMiddleware, helperController.createHelper)

router.get('/:id', helperController.getHelperById)

router.delete('/:id', helperController.deleteHelper)

router.put('/:id', fileUploadMiddleware, helperController.updateHelper)

router.post('/download-helpers', helperController.downloadHelpers)

export default router

