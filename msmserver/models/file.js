import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    identifier: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
    },
    fileID: {
        type: String,
    },
});

const File = mongoose.model('File', fileSchema);
export default File;