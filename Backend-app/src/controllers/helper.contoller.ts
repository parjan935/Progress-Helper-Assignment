import { error } from "console";
import { HelperServices } from "../services/helper.service";
import { Request, Response } from 'express';

const helperService = new HelperServices();

const helperKeys: string[] = [
    'name',
    'profilePic',
    // 'email',
    'gender',
    'phone',
    'service',
    'organization',
    'languages',
    'vehicleType',
    // 'vehicleNo',
    'kycDocx',
    // 'additionalDocx',
]

export class HelperControllers {
    async getNextHelpers(req: Request, res: Response) {
        const { pageNo } = req.body
        try {
            const response = await helperService.getHelpersByFilters(req.body)
            const data = response.helpers.slice(pageNo * 10, pageNo * 10 + 10)
            res.json({ helpers: data, totalHelperCount: response.count, filteredHelpersCount: response.helpers.length })
            // res.json({ helpers: data, totalHelperCount: helpers.length })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async getHelperById(req: Request, res: Response) {
        const id: string = req.params.id as string
        try {
            const helper = await helperService.getHelperById(id)
            if (helper) res.json(helper);
            else res.status(404).json({ message: "Helper Not Found" })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async createHelper(req: Request, res: Response) {

        const missingkeys: string[] = []
        helperKeys.forEach((key) => {
            if (!Object.keys(req.body).includes(key)) missingkeys.push(key)
        })
        if (missingkeys.length > 0) {
            return res.status(400).json({ error: "missing fields in req.body", missingFields: missingkeys })
        }

        const helperData = req.body
        try {
            const newHelper = await helperService.createHelper(helperData)
            if (newHelper) res.json({ message: 'Helper added successfully!', helper: newHelper })
            else res.status(400).json({ message: 'error adding helper' })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async deleteHelper(req: Request, res: Response) {
        const id: string = req.params.id as string
        try {
            await helperService.deleteHelper(id)
            res.json({ message: "Helper deleted successfully!" })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async updateHelper(req: Request, res: Response) {
        const id: string = req.params.id as string
        const helper = req.body
        try {
            await helperService.updateHelper(id, helper)
            res.json({ message: "Helper updated successfully!" })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async downloadHelpers(req: Request, res: Response) {
        try {
            const response: Buffer = await helperService.downloadHelpers(req.body)
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Helpers.xlsx"
            );
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.send(response)
        } catch (error) {
            res.status(500).json(error)
        }
    }
}