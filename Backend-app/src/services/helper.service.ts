import { Counter } from "../models/counter.model";
import Helper from "../models/helper.model";
import generateQRCode from "../utils/generateQR";

import * as XLSX from 'xlsx';

export interface IHelper {
    name: string;
    profilePic: string;
    email: string;
    gender: string;
    phone: string;
    service: string;
    organization: string;
    languages: string[] | string;
    employeeId_QR: string;
    employeeID: Number;
    vehicleType: string;
    vehicleNo?: string;
    kycDocx: {};
    additionalDocx?: {} | null;
    dateJoined?: Date | string;
}

export class HelperServices {

    private async getNextEmployeeID() {
        const counter = await Counter.findByIdAndUpdate(
            'employeeID',
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return counter.seq;
    }

    async getAllHelpers(): Promise<IHelper[]> {
        const helpers: IHelper[] = await Helper.find().sort({ name: 1 });
        return helpers;
    }

    async getHelpersByFilters(payload: any): Promise<IHelper[]> {
        const { services, orgs, searchVal } = payload

        const filter = []
        if (services.length > 0) filter.push({ service: { $in: services } })
        if (orgs.length > 0) filter.push({ organization: { $in: orgs } })
        filter.push({ name: { $regex: searchVal, $options: 'i' } });

        const helpers = await Helper.aggregate([{ $match: { $and: filter } }, { $sort: { name: 1 } }])
        return helpers
    }

    async getHelperById(id: string): Promise<IHelper | null> {
        const helper = await Helper.findById(id);
        return helper
    }

    async createHelper(helper: IHelper): Promise<IHelper> {

        helper.employeeID = await this.getNextEmployeeID()

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
        helper.languages = lang.split(',')

        const newHelper: IHelper = await Helper.insertOne(helper)
        return newHelper;
    }

    async deleteHelper(id: string) {
        await Helper.findByIdAndDelete(id)
    }

    async updateHelper(id: string, helper: IHelper) {

        const lang = helper.languages as string
        helper.languages = lang.split(',')

        if (helper.additionalDocx === 'null') {
            helper.additionalDocx = null
        }

        await Helper.findByIdAndUpdate(id, helper)
    }

    async downloadHelpers(helpers: any): Promise<Buffer> {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(helpers);

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Helpers');

        const buffer: Buffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        });

        return buffer;
    }
}