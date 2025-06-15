import mongoose  from "mongoose";

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    })
}

export default connectDB;