import express from "express";
import passport from "passport";
import { registerNewUser, deleteAccount, updateEmail, updateName, updatePremium, updatePassword, updateImage, verifyEmail, getUsers, checkPremium, checkGroupsCreated } from "../controllers/userController.js";

var router = express.Router();

router.post("/login", async (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        try {
            if (err) {
                return res.status(400).json({ errors: err });
            }

            if (!user) {
                return res.status(400).json({ errors: "No user found" });
            }

            req.logIn(user, (err) => {
                if (err) {
                    return res.status(400).json({ errors: err });
                }
                return res.status(200).json(user);
            });
        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).json({ errors: "Internal Server Error" });
        }
    })(req, res, next);
});

router.post("/getUsers", getUsers);

router.post("/checkPremium", checkPremium);

router.post("/checkGroupsCreated", checkGroupsCreated);

router.post('/verifyEmail', verifyEmail);

router.post("/register", registerNewUser);

router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return res.status(400).json({ errors: err });
        }
        return res.json({ message: "Logout successful" });
    });
});

router.delete("/deleteAccount", deleteAccount);

router.patch("/updateEmail", updateEmail);

router.patch("/updateName", updateName);
router.patch("/updatePremium", updatePremium);

router.patch("/updatePassword", updatePassword);
router.patch("/updateImage", updateImage);

export default router;