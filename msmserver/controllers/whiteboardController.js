import Whiteboard from '../models/whiteboard.js';
import Chat from '../models/chat.js';

export const toggleLock = async (identifier) => {
    try {
        const filter = { "identifier": identifier };

        // Retrieve the current value of the locked field
        const whiteboard = await Whiteboard.findOne(filter);
        const currentLockValue = whiteboard.lock;

        // Use $set to toggle the lock attribute
        const update = { "$set": { "lock": !currentLockValue } };
        const response = await Whiteboard.updateOne(filter, update);

        return response;
    } catch (ex) {
        console.log(ex.message);
        throw ex;
    }
};


export const getPaths = async (req, res, next) => {
    try {
      const filter = { "identifier": req.body.identifier };
      const whiteboard = await Whiteboard.findOne(filter);
  
      if (!whiteboard) {
        return res.status(404).json({ errors: 'Whiteboard not found' });
      }
  
      return res.json(whiteboard.paths);
    } catch (ex) {
      return res.status(500).json({ errors: 'Internal server error' });
    }
  };

export const savePath = async (identifier, path, color, strokeWidth, opacity) => {
    try {
        const filter = { "identifier": identifier };
        const update = { 
            "$push": { 
                "paths": { 
                    "path": path, 
                    "color": color, 
                    "strokeWidth": strokeWidth, 
                    "opacity": opacity 
                } 
            } 
        };

        Whiteboard.updateOne(filter, update, { upsert: true }).then(
            (response) => { return response; }
        );
    } catch (ex) {
        console.log(ex.message);
    }
};

export const deletePath = async (identifier, path, color, strokeWidth, opacity) => {
    try {
        const filter = { "identifier": identifier };
        const update = {
            "$pull": {
                "paths": {
                    "path": path,
                    "color": color,
                    "strokeWidth": strokeWidth,
                    "opacity": opacity
                }
            }
        };

        const response = await Whiteboard.updateOne(filter, update);
        return response;
    } catch (ex) {
        console.log(ex.message);
    }
};

export const getLock = async (req, res, next) => {
    try {
        const identifier = req.body.identifier;

        if (!identifier) {
            return res.status(400).json({ errors: 'Identifier not provided' });
        }

        const whiteboard = await Whiteboard.findOne({ identifier });

        if (!whiteboard) {
            return res.status(404).json({ errors: 'Whiteboard not found' });
        }

        return res.json({ lock: whiteboard.lock });
    } catch (ex) {
        console.error('Error during getLock:', ex);
        return res.status(500).json({ errors: 'Internal server error' });
    }
};

export const getBubbles = async (req, res, next) => {
    try {
        const identifier = req.body.identifier
        if (!identifier) {
            return res.status(400).json({ errors: 'Identifier not provided' });
        }
        const filter = { "identifier": identifier };

        const response = await Whiteboard.findOne(filter);

        if (!response) {
            return res.status(404).json({ errors: 'Whiteboard not found' });
        }

         return res.json(response.bubbles);
    } catch (ex) {
        console.error('Error during getBubbles:', ex);
        return res.status(500).json({ errors: 'Internal server error' });
    }
};

export const saveBubble = async (identifier, index, locationX, locationY) => {
    try {
        const filter = { "identifier": identifier };
        const update = { 
            "$push": { 
                "bubbles": { 
                    "index": index, 
                    "locationX": locationX, 
                    "locationY": locationY, 
                } 
            } 
        };

        Whiteboard.updateOne(filter, update, { upsert: true }).then(
            (response) => { return response; }
        );
    } catch (ex) {
        console.log(ex.message);
    }
};

export const deleteBubble = async (identifier, index) => {
    try {
        const filter = { "identifier": identifier };
        const update = {
            "$pull": {
                "bubbles": { "index": index }
            }
        };

        // Delete the specified bubble
        const response = await Whiteboard.updateOne(filter, update);

        // Decrement indexes of the next bubbles
        const updateIndexes = {
            "$inc": {
                "bubbles.$[element].index": -1
            }
        };

        const options = {
            arrayFilters: [{ "element.index": { "$gt": index } }]
        };

        await Whiteboard.updateMany(filter, updateIndexes, options);
        console.log("bubble deleted");
        updateMessagesAfterDeleteBubble(identifier, index);
        return response;
    } catch (ex) {
        console.log(ex.message);
    }
};

export const updateMessagesAfterDeleteBubble = async (identifier, index) => {
    try {
        const filter = { "identifier": identifier, "messages.bubble": index };
        const update = {
            "$set": {
                "messages.$.bubble": -1
            }
        };

        // Update the specified message
        const response = await Chat.updateOne(filter, update);

        // Decrement indexes of the next messages with bubble > index
        const condition = { "identifier": identifier, "messages.bubble": { "$gt": index } };
        const updateIndexes = {
            "$inc": {
                "messages.$[element].bubble": -1
            }
        };

        const options = {
            arrayFilters: [{ "element.bubble": { "$gt": index } }]
        };

        await Chat.updateMany(condition, updateIndexes, options);
        console.log("messages updated");
        return response;
    } catch (ex) {
        console.log(ex.message);
    }
};



export const updateBubble = async (identifier, index, locationX, locationY) => {
    try {
        const filter = {
            "identifier": identifier,
            "bubbles.index": index 
        };

        const update = {
            "$set": {
                "bubbles.$.locationX": locationX,
                "bubbles.$.locationY": locationY
            }
        };

        const response = await Whiteboard.updateOne(filter, update);
        return response;
    } catch (ex) {
        console.log(ex.message);
        throw ex;
    }
};

