import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const groupSchema = new mongoose.Schema({
    identifier: {
        type: String,
        unique: true,
    },
    groupname: {
        type: String,
    },
    subject: {
        type: String,
    },
    users: [{
        email: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    }],
    public:{
        type: Boolean,
        default:true
    },
    pending: [{
        email: {
            type: String,
        },
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    meetings: [{
        title: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
    }],
    ratings: [{
        user: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        review: {
            type: String,
            required: true,
        },
    }],
    image: {
        type: String
    },
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
