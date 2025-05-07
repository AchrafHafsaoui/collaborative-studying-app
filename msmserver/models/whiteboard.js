import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const whiteboardSchema = new Schema({
    identifier: {
        type: String,
        required: true
    },
    paths: [{
        path: String,
        color: String,
        strokeWidth: Number,
        opacity: Number,
    }],
    bubbles: [{
        index: Number,
        locationX: Number,
        locationY: Number,
    }],
    lock:{
        type: Boolean,
        default: false
    }
});

const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);
export default Whiteboard;
