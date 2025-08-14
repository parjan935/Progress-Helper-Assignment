import mongoose, { Schema } from "mongoose";


const helperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePic: { type: String, default: '' },
    email: { type: String, default: null},
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    organization: { type: String, required: true },
    languages: { /// 
        type: [{ type: Schema.Types.String, required: true }],
        required: true
    },
    employeeId_QR: { type: String, required: true },
    employeeID: { type: Number, required: true, unique: true },
    vehicleType: { type: String, required: true }, 
    vehicleNo: { type: String, default: '' },
    kycDocx: {
        type: {
            fileName: String,
            mimeType: String,
            base64File: String,
        },
        required: true
    },

    additionalDocx: {
        type: {
            fileName: String,
            mimeType: String,
            base64File: String,
        },
        default: null
    },
    dateJoined: { type: Date, required: true }
})

const Helper = mongoose.model('Helper', helperSchema);

export default Helper;