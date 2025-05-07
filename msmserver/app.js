import express from 'express'
import session from 'express-session'
import cors from 'cors'
import chatRoutes from './routes/chatRoutes.js'
import authRoutes from './routes/authRoutes.js'
import whiteboardRoutes from './routes/whiteboardRoutes.js'; 
import groupRoutes from './routes/groupRoutes.js'; 
import paymentRoutes from './routes/paymentRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import passport from "./passport/passport_local_strategy.js";
import rateLimitMiddleware from './middleware/rateLimiter.js'

function createApp() {
    const corsOptions = {
        origin: true,
        credentials: true,            //access-control-allow-credentials:true
      };

    const app = express();
    app.use(cors(corsOptions));
    app.use(
    session({
        secret: "big secret",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true } //store: new MongoDBStore({ mongooseConnection: mongoose.connection })
    })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static("public"));
    app.use(express.json());
    app.use(rateLimitMiddleware);
    app.use("/api/chat/", chatRoutes);
    app.use("/api/group/", groupRoutes);
    app.use("/api/auth/", authRoutes);
    app.use('/api/whiteboard/', whiteboardRoutes);
    app.use('/api/group/', groupRoutes);
    app.use('/api/payment/', paymentRoutes);
    app.use('/api/file/', fileRoutes);

    return app;
};

export default createApp();