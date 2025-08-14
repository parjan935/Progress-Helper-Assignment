
import { NextFunction, Request, Response } from "express";
import multer from "multer"
const upload = multer({ storage: multer.memoryStorage() })



export const fileUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const uploader = upload.fields([
        { name: 'kycDocx', maxCount: 1 },
        { name: 'additionalDocx', maxCount: 1 }
    ]);

    uploader(req, res, (err: any) => {
        if (err) return res.status(400).json({ error: err.message });

        const files = req.files as { [fieldname: string]: any };
        const kycFile = files?.kycDocx?.[0]
        const additionalDocx = files?.additionalDocx?.[0]

        req.body.kycDocx = {
            fileName: kycFile?.originalname,
            mimeType: kycFile?.mimetype,
            base64File: kycFile?.buffer.toString('base64'),
        }
        
        if (additionalDocx) {
            req.body.additionalDocx = {
                fileName: additionalDocx?.originalname,
                mimeType: additionalDocx?.mimetype,
                base64File: additionalDocx?.buffer.toString('base64'),
            }
        }
        else {
            req.body.additionalDocx = null
        }

        next();
    });
};