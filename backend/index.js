import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import authRouter from "./routes/authRoute.js";
import projectRoutes from "./routes/projectRoute.js";
import taskRoutes from "./routes/taskRoute.js";
import profileRoutes from "./routes/profileRoutes.js"
import teamRoutes from "./routes/teamRoute.js"
import commentRoutes from "./routes/commentRoute.js"
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/team',teamRoutes)
app.use('/api/comments',commentRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})