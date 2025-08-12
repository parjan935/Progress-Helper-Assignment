import Helper from "../models/helper.model";
import generateQRCode from "../utils/generateQR";
export interface IHelper {

    name: string;
    profilePic?: string;
    email: string;
    gender: string;
    phone: string;
    service: string;
    organization: string;
    languages: string[] | string;
    households?: number | null;
    employeeId_QR: string;
    employeeID: Number;
    vehicleType: string;
    vehicleNo?: string;
    kycDocx: {};
    additionalDocx?: {} | null;
    dateJoined?: Date | string;
}



export class HelperServices {
    async getAllHelpers(): Promise<IHelper[]> {
        const helpers: IHelper[] = await Helper.find()
        const sortedHelpers = [...helpers].sort((a, b) => {
            const h1 = a['name']?.toString().toLowerCase();
            const h2 = b['name']?.toString().toLowerCase();
            return h1.localeCompare(h2);
        })
        return sortedHelpers;
    }

    async getHelpersByFilters(payload: any): Promise<IHelper[]> {
        const { services, orgs, searchVal } = payload

        const filter = []
        if (services.length > 0) filter.push({ service: { $in: services } })
        if (orgs.length > 0) filter.push({ organization: { $in: orgs } })
        filter.push({ name: { $regex: searchVal, $options: 'i' } });
        const helpers = await Helper.aggregate([{ $match: { $and: filter } }])
        const sortedHelpers = [...helpers].sort((a, b) => {
            const h1 = a['name']?.toString().toLowerCase();
            const h2 = b['name']?.toString().toLowerCase();
            return h1.localeCompare(h2);
        })
        return sortedHelpers
    }

    async getHelperById(id: string): Promise<IHelper | null> {
        const helper = await Helper.findById(id);
        return helper
    }


    async createHelper(helper: IHelper, files?: { [fieldname: string]: globalThis.Express.Multer.File[] }): Promise<IHelper> {

        let employeeID = 100

        const emp = await Helper.findOne()
            .sort({ employeeID: -1 })
            .select('employeeID');

        if (emp) employeeID = emp.employeeID + 1
        helper.employeeID = employeeID

        const payload = {
            name: helper.name,
            id: helper.employeeID,
            email: helper.email,
            organization: helper.organization,
            service: helper.service
        }
        await generateQRCode(payload).then((qr) => {
            helper.employeeId_QR = qr
        })

        helper.dateJoined = new Date()

        const lang = helper.languages as string
        helper.languages=lang.split(',')


        const kycFile = files?.kycDocx?.[0]
        const additionalDocx = files?.additionalDocx?.[0]

        helper.kycDocx = {
            fileName: kycFile?.originalname,
            mimeType: kycFile?.mimetype,
            base64File: kycFile?.buffer.toString('base64'),
        }
        helper.additionalDocx = {
            fileName: additionalDocx?.originalname,
            mimeType: additionalDocx?.mimetype,
            base64File: additionalDocx?.buffer.toString('base64'),
        }

        const newHelper: IHelper = await new Helper(helper).save()
        return newHelper;
    }

    async deleteHelper(id: string) {
        await Helper.findByIdAndDelete(id)
    }

    async updateHelper(id: string, helper: IHelper, files?: { [fieldname: string]: globalThis.Express.Multer.File[] }) {
        const kycFile = files?.kycDocx?.[0]
        const additionalDocx = files?.additionalDocx?.[0]

        if (kycFile) {
            helper.kycDocx = {
                fileName: kycFile.originalname,
                mimeType: kycFile.mimetype,
                base64File: kycFile.buffer.toString('base64'),
            }
        }
        if (additionalDocx) {
            helper.additionalDocx = {
                fileName: additionalDocx.originalname,
                mimeType: additionalDocx.mimetype,
                base64File: additionalDocx.buffer.toString('base64'),
            }
        }
        if (!helper?.profilePic || helper.profilePic.trim() == '') {
            helper.profilePic = `https://ui-avatars.com/api/?name=${helper.name}&background=random&color=333&rounded=true&length=2`;
        }

        if (helper.additionalDocx === 'null') {
            helper.additionalDocx = null
        }
        await Helper.findByIdAndUpdate(id, helper)
    }
}