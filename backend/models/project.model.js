import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
    },
    startDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;