import mongoose from "mongoose";

const ThirdPartyProviderSchema = new mongoose.Schema({
    provider_name: {
        type: String,
        default: null
    },
    provider_id: {
        type: String,
        default: null
    },
    provider_data: {
        type: {},
        default: null
    }
})

// Create Schema
const userSchema = new mongoose.Schema(
    {
        image: {
            type: String
        },
        name: {
            type: String
        },
        surname: {
            type: String
        },
        university: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        verificationCode: {
            type: Number,
        },
        password: {
            type: String
        },
        referral_code: {
            type: String,
            default: function () {
                let hash = 0;
                for (let i = 0; i < this.email.length; i++) {
                    hash = this.email.charCodeAt(i) + ((hash << 5) - hash);
                }
                let res = (hash & 0x00ffffff).toString(16).toUpperCase();
                return "00000".substring(0, 6 - res.length) + res;
            }
        },
        referred_by: {
            type: String,
            default: null
        },
        third_party_auth: [ThirdPartyProviderSchema],
        date: {
            type: Date,
            default: Date.now
        },
        premium: {
            type: Boolean,
            default: false
        },
        groupsCreated:{
            type: Number,
            default: 0
        }
    },
    { strict: false }
);

userSchema.methods.deleteUser = async function () {
    await this.remove();
};


const User = mongoose.model('User', userSchema);
export default User;