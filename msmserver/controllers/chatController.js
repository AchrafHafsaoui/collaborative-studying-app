import Chat from "../models/chat.js";

export const getChatHistory = async (req, res, next) => {
    try {
        const filter = { "identifier": req.body.identifier };
        const response = await Chat.findOne(filter);
        if (!response) {
            console.log('Chat not found for identifier:', req.body.identifier);
            return res.status(404).json({ errors: 'Chat not found' });
        }
        return res.json(response.messages);
    } catch (ex) {
        console.error('Error during getChatHistory:', ex);
        return res.status(500).json({ errors: 'Internal server error' });
    }
};


export const saveMsg = async (identifier, from, userImage, messageText, imageData, bubble, time) => {
    try {
        const filter = { "identifier": identifier };
        const update = {
            "$push": {
                "messages": {
                    "from": from,
                    "userImage": userImage,
                    "messageText": messageText,
                    "imageData": imageData,
                    "bubble": bubble,
                    "time": time,
                    "datetime": new Date()
                }
            }
        };

        return Chat.updateOne(filter, update, { upsert: true });
    } catch (ex) {
        console.log(ex.message);
        throw ex;
    }
};


export const createChat = async (req, res, next) => {
    try {
        const chat = new Chat({
            identifier: req.body.identifier,
            messages: [],
        });

        chat.save()
            .then(() => {
                return res.status(200).json({ identifier: req.body.identifier });
            })
            .catch((ex) => {
                console.error('Error at chat creation', ex);
                return res.status(500).json({ errors: 'Internal server error' });
            });
    } catch (ex) {
        console.error('Error at chat creation', ex);
        return res.status(500).json({ errors: 'Internal server error' });
    }
};





