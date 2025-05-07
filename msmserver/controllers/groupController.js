import Group from '../models/group.js';
import Whiteboard from '../models/whiteboard.js';
import Chat from '../models/chat.js';
import User from '../models/user.js';

//anyone can join or not
export const changePublic = async (identifier) => {
  try {
    const filter = { "identifier": identifier };

    // Retrieve the current value of the public field and the pending users
    const group = await Group.findOne(filter);
    const currentPublicValue = group.public;
    const pendingUsers = group.pending || [];

    // Use $set to toggle the public attribute
    const update = { "$set": { "public": !currentPublicValue } };
    const response = await Group.updateOne(filter, update);

    // If transitioning from private to public, process pending users
    if (!currentPublicValue) {
      // Iterate through pending users and call joinGroup for each
      for (const pendingUser of pendingUsers) {
        await joinGroup(identifier, pendingUser.email, false, true); // Assuming isAdmin is false for pending users
      }

      // Clear the pending array after processing
      await Group.updateOne(filter, { "$set": { "pending": [] } });
    }

    return response;
  } catch (ex) {
    console.log(ex.message);
    throw ex;
  }
};

export const getPublic = async (req, res, next) => {
  try {
    const identifier = req.body.identifier;

    if (!identifier) {
      return res.status(400).json({ errors: 'Identifier not provided' });
    }

    const group = await Group.findOne({ identifier });

    if (!group) {
      return res.status(404).json({ errors: 'Group not found' });
    }

    return res.json({ public: group.public });
  } catch (ex) {
    console.error('Error during getLock:', ex);
    return res.status(500).json({ errors: 'Internal server error' });
  }
};

export const getMemberDetails = async (req, res, next) => {
  try {
    const response = await Group.find();

    if (response.length === 0) {
      return res.status(404).json({ errors: 'Member details not found' });
    }

    return res.json(response);
  } catch (ex) {
    return res.status(500).json({ errors: 'Internal server error' });
  }
};

// Import necessary modules and models

export const getGroups = async (req, res, next) => {
  try {
    const userEmail = req.query.email;
    const groupIdentifier = req.query.identifier;

    if (userEmail) {
      // If userEmail is provided, find groups with that user
      const groups = await Group.find({ 'users.email': userEmail });

      const groupDetails = groups.map(group => ({
        identifier: group.identifier,
        groupname: group.groupname,
        subject: group.subject,
        users: group.users.map(user => ({
          email: user.email,
          isAdmin: user.isAdmin,
        })),
        pending: group.pending || [],
        public: group.public,
        averageRating: group.averageRating,
        ratings: group.ratings,
        meetings: group.meetings,
        image: group.image
      }));

      res.json(groupDetails);
    } else if (groupIdentifier) {
      // If groupIdentifier is provided, find the specific group
      const group = await Group.findOne({ identifier: groupIdentifier });

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      const groupDetails = {
        identifier: group.identifier,
        groupname: group.groupname,
        subject: group.subject,
        users: group.users.map(user => ({
          email: user.email,
          isAdmin: user.isAdmin,
        })),
        pending: group.pending || [],
        public: group.public,
        averageRating: group.averageRating,
        ratings: group.ratings,
        meetings: group.meetings,
        image: group.image
      };

      res.json(groupDetails);
    } else {
      // If neither userEmail nor groupIdentifier is provided, return an error
      res.status(400).json({ error: "Invalid request. Provide either 'email' or 'identifier' as a query parameter." });
    }
  } catch (ex) {
    console.log(ex.message);
    res.status(500).json({ error: "Internal Server Error" });
    next(ex);
  }
};

export const getGroupall = async (req, res, next) => {
  try {
    // Alle Gruppen abrufen
    const groups = await Group.find();

    // Details für alle Gruppen vorbereiten
    const groupDetails = groups.map(group => ({
      identifier: group.identifier,
      groupname: group.groupname,
      subject: group.subject,
      users: group.users.map(user => ({
        email: user.email,
        isAdmin: user.isAdmin,
      })),
      pending: group.pending || [],
      public: group.public,
      averageRating: group.averageRating,
      ratings: group.ratings,
      meetings: group.meetings || [], // Wenn meetings nicht vorhanden ist, leeres Array verwenden
      image: group.image,
    }));

    // Alle Gruppendetails zurückgeben
    res.json(groupDetails);
  } catch (ex) {
    console.log(ex.message);
    res.status(500).json({ error: "Internal Server Error" });
    next(ex);
  }
};


export const createGroup = async (identifier, admin, groupname, subject, users, image) => {
  try {
    const adminUser = await User.findOne({ email: admin });
    if (adminUser.premium || adminUser.groupsCreated < 5) {
      const groupCount = await Group.countDocuments();
      const identifier = groupCount + 1;
      const groupNameWithId = `${groupname}${identifier}`; //Each group has a unique name to search
      const group = new Group({
        identifier: identifier,
        groupname: groupNameWithId,
        subject: subject,
        meetings: [],
        ratings: [],
        public: true,
        pending: [],
        averageRating: 0,
        image: image,
      });

      await group.save();
      //Create a whiteboard and a chat for the group
      createWhiteboard(identifier);
      createChat(identifier);

      joinGroup(identifier, admin, true, true, false);

      users.split(',').forEach((user) => {
        if (user !== '') {
          joinGroup(identifier, user, false, true, false);
        }
      });

      adminUser.groupsCreated = (adminUser.groupsCreated || 0) + 1;
      await adminUser.save();
      return identifier;
    }
    else {
      throw new Error('User does not meet criteria to create a new group.');
    }
  } catch (ex) {
    console.log(ex.message);
    throw ex;
  }
};

export const createWhiteboard = async (identifier) => {
  try {
    if (!identifier) {
      return res.status(404).json({ errors: 'Identifier not provided' });
    }
    const whiteboard = new Whiteboard({
      identifier: identifier,
      paths: [],
    });

    whiteboard.save().then(() => {
      return identifier;
    });
  } catch (ex) {
    return res.status(500).json({ errors: 'Internal server error' });
  }
};

export const createChat = async (identifier) => {
  try {
    const chat = new Chat({
      identifier: identifier,
      messages: [],
    });

    chat.save()
      .then(() => {
        return identifier;
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

export const changeAdmin = async (id, user, promoted) => {
  try {
    const filter = { "identifier": id, "users.email": user };
    const update = { "$set": { "users.$.isAdmin": promoted } };
    const response = await Group.updateOne(filter, update);

    return response;
  } catch (ex) {
    console.log(ex.message);
    throw ex;
  }
};


export const joinGroup = async (id, user, isAdmin, acceptedByAdmin, rejectedByAdmin) => {
  try {
    const filter = { "identifier": id };
    const group = await Group.findOne(filter);

    if (!group) {
      throw new Error("Group not found");
    }

    const isUserPending = group.pending.some((pendingUser) => pendingUser.email === user);

    if (group.public || acceptedByAdmin) {
      // If group is public or user accepted by admin add the user to users and remove him from pending
      const update = {
        "$push": {
          "users": {
            "email": user,
            "isAdmin": isAdmin || false,
          }
        },
        "$pull": {
          "pending": {
            "email": user,
          }
        }
      };
      return Group.updateOne(filter, update, { upsert: true });
    } else if (rejectedByAdmin) {
      // If user is rejected, remove from pending array
      const update = {
        "$pull": {
          "pending": {
            "email": user,
          }
        }
      };
      return Group.updateOne(filter, update, { upsert: true });
    } else if (!isUserPending) {
      // If the group is private, add the user to the "pending" array
      const update = {
        "$push": {
          "pending": {
            "email": user,
          }
        }
      };
      return Group.updateOne(filter, update, { upsert: true });
    }
  } catch (ex) {
    console.log(ex.message);
    throw ex;
  }
};



export const removeMember = async (identifier, userId) => {
  try {
    console.log("Gruppen-ID:", identifier);
    console.log("Benutzer-ID:", userId);
    // Finde die Gruppe anhand der Kennung
    const group = await Group.findOne({ identifier });

    if (!group) {
      return res.status(404).json({ errors: 'Group not found' });
    }

    const memberIndex = group.users.findIndex(
      (users) => users.email === userId
    );

    if (memberIndex !== -1) {
      // Entferne den Benutzer aus dem Array
      group.users.splice(memberIndex, 1);

      // Speichere die aktualisierte Gruppe
      await group.save();

      return group.users;
    } else {
      return res.status(404).json({ errors: 'User not found' });
    }
  } catch (ex) {
    return res.status(500).json({ errors: 'Internal server error' });
  }
}

export const updateImage = async (req, res) => {
  try {
    const { identifier, image } = req.body;

    const group = await Group.findOne({ identifier });

    if (!group) {
      return res.status(404).json({ errors: "Group not found" });
    }

    group.image = image;
    await group.save();

    return res.json(group);
  } catch (error) {
    console.error("Update image error:", error);
    return res.status(500).json({ errors: error.message });
  }
};


export const addRating = async (groupIdentifier, userEmail, rating, review) => {
  try {
    const group = await Group.findOne({ identifier: groupIdentifier });

    if (!group) {
      return res.status(404).json({ errors: 'Group not found' });
    }

    // Check if user has already rated the group
    const existingRatingIndex = group.ratings.findIndex((r) => r.user === userEmail);

    if (existingRatingIndex !== -1) {
      // User has already rated, update the existing rating
      group.ratings[existingRatingIndex].rating = rating;
      group.ratings[existingRatingIndex].review = review;
    } else {
      // User hasn't rated, add a new rating
      group.ratings.push({
        user: userEmail,
        rating,
        review,
      });
    }

    // Calculate the new averageRating
    const totalRating = group.ratings.reduce((sum, r) => sum + r.rating, 0);
    group.averageRating = totalRating / group.ratings.length;

    await group.save();

    return { statusCode: 200, averageRating: group.averageRating };
  } catch (ex) {
    console.error('Error during addRating:', ex);

    if (ex.statusCode) {
      throw ex;
    } else {
      throw { statusCode: 500, message: "Internal server error" };
    }
  }
};

export const addMeeting = async (identifier, title, date, time) => {
  try {
    // Find the group by identifier
    const group = await Group.findOne({ identifier });

    if (!group) {
      throw new Error("Group not found");
    }

    // Add the new meeting to the meetings array
    group.meetings.push({
      title: title,
      date: date,
      time: time,
    });

    // Save the updated group
    await group.save();

    return group.meetings;
  } catch (ex) {
    console.log(ex.message);
    throw ex;
  }
};

export const deleteMeeting = async (identifier, title, date, time) => {
  try {
    // Find the group by identifier
    const group = await Group.findOne({ identifier });

    if (!group) {
      throw new Error("Group not found");
    }

    // Find the index of the meeting in the meetings array
    const meetingIndex = group.meetings.findIndex(
      (meeting) => meeting.title === title && meeting.date === date && meeting.time === time
    );

    if (meetingIndex !== -1) {
      // Remove the meeting from the array
      group.meetings.splice(meetingIndex, 1);

      // Save the updated group
      await group.save();

      return group.meetings;
    } else {
      throw new Error("Meeting not found");
    }
  } catch (ex) {
    console.log(ex.message);
    throw ex;
  }
};
