import User from "../models/user.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import {google} from  'googleapis';
const OAuth2 = google.auth.OAuth2;

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (ex) {
    console.error('Error during getUsers:', ex);
    return res.status(500).json({ errors: 'Internal server error' });
  }
};

export const registerNewUser = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ errors: 'User already exists!' });
    }

    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      surname: req.body.surname,
      university: req.body.university,
      password: req.body.password,
    });

    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (err) {
          console.error('Error during password hashing:', err);
          return res.status(500).json({ errors: 'Internal Server Error' });
        }

        newUser.password = hash;

        try {
          // Step 2: Generate Verification Code
          const verificationCode = generateVerificationCode();
          newUser.verificationCode = verificationCode;

          // Save user information and verification code in the database
          await newUser.save();

          // Step 3: Send Verification Email
          sendVerificationEmail(newUser.email, verificationCode);

          return res.json(newUser);
        } catch (error) {
          console.error('Error during user registration:', error);
          return res.status(500).json({ errors: 'Internal Server Error' });
        }
      });
    });
  } catch (ex) {
    console.error('Error during user registration:', ex);
    next(ex);
  }
};

// Helper function to generate a random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            console.log("*ERR: ", err)
            reject();
          }
          resolve(token); 
        });
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.USER_EMAIL,
          accessToken,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        },
      });
      return transporter;
  } catch (err) {
    return err
  }
};


// Helper function to send verification email
async function sendVerificationEmail(email, code) {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${code}`,
    }

    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(mailOptions);
  } catch (err) {
    console.log("ERROR: ", err)
  }
}

export const verifyEmail = async (req, res, next) => {

  try {
    const { email, verificationCode } = req.body;

    // Find the user by email and verification code
    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res.status(400).json({ errors: 'Invalid verification code or email' });
    }

    // Mark the user as verified (you can set a 'verified' field in your User schema)
    user.verified = true;

    // Save the updated user document
    await user.save();

    return res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.status(500).json({ errors: 'Internal Server Error' });
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ errors: "UserId not provided" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (user === null) {
      return res.status(404).json({ errors: "User not found" });
    }

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);

        return res.status(500).json({ errors: "Internal Server Error" });
      }

      return res.json({ message: "Account deleted successfully" });
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({ errors: "Internal Server Error" });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { userId, image } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { image: image },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Update image error:", error);
    return res.status(500).json({ errors: error.message });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { userId, email } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Update email error:", error);
    return res.status(500).json({ errors: error.message });
  }
};

export const updateName = async (req, res) => {
  try {
    const { userId, name, surname } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, surname },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Update name and surname error:", error);
    return res.status(500).json({ errors: error.message });
  }
};

export const updatePremium = async (req, res) => {
  try {
    const { userId, premium } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { premium },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Update name and surname error:", error);
    return res.status(500).json({ errors: error.message });
  }
};

export const checkPremium = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    const isPremium = user.premium;

    return res.json({ isPremium });
  } catch (error) {
    console.error("Check premium error:", error);
    return res.status(500).json({ errors: error.message });
  }
};

export const checkGroupsCreated = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    const groupsCreated = user.groupsCreated;

    return res.json({ groupsCreated });
  } catch (error) {
    console.error("Check groupsCreated error:", error);
    return res.status(500).json({ errors: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ errors: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newHashedPassword;

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update password error");
    return res.status(500).json({ errors: error.message });
  }
};

