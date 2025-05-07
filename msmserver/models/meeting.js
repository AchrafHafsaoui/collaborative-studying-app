import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const meetingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: String
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
