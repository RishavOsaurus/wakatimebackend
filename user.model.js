import mongoose from "mongoose";

// Define the schema for the User collection
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name is required"], // Add a custom error message
    },
    api_key: {
        type: String,
        required: [true, "WakaTime API key is required"],
        unique: true // Ensures no two users can have the same API key
    }
});

// Create and export the Mongoose model
// Mongoose will create a collection named 'users' in the database
const User = mongoose.model('User', UserSchema);
export default User