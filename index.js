import express from "express";
import mongoose from "mongoose";
import { getWakaTimeSummaries , getAllUsers, deleteUser, updateUser} from "./function.js";
import User from "./user.model.js";
import cors from 'cors';



const MONGO_URI =
  process.env.MONGO_URL


console.log(MONGO_URI)
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch((err) => console.error("Could not connect to MongoDB.", err));

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors());

// Define the correct password

const CORRECT_PASSWORD = process.env.CORRECT_PASSWORD
console.log(CORRECT_PASSWORD)

const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} - ${req.url}`);
  next();
};
app.use(logger);

// --- NEW PASSWORD VERIFICATION ROUTE ---
app.post("/verify-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }

  if (password === CORRECT_PASSWORD) {
    // Passwords match
    res.status(200).json({ message: "Password verified successfully." });
  } else {
    // Passwords do not match
    res.status(401).json({ error: "Invalid password." });
  }
});

app.post("/addUser", async (req, res) => {
  try {
    const { name, api_key } = req.body;

    if (!name || !api_key) {
      return res.status(400).json({ error: "Name and api_key are required." });
    }

    const newUser = new User({ name, api_key });
    await newUser.save();

    console.log("User added successfully:", newUser.name);
    res
      .status(201)
      .json({ message: "User added successfully!", user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      console.error("Error adding user: Duplicate API key.");
      return res
        .status(409)
        .json({ error: "A user with this API key already exists." });
    }
    console.error("Error in /addUser:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/today", async (req, res) => {
  try {
    const timeData = await getWakaTimeSummaries("Today");
    res.status(200).json({ data: timeData });
  } catch (error) {
    console.error("Error in /todaytime:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/lastweek", async (req, res) => {
  try {
    const timeData = await getWakaTimeSummaries("Last_7_Days");
    res.status(200).json({ data: timeData });
  } catch (error) {
    console.error("Error in /lastweek:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/admin/users", async (req, res) => {
  try {
    const { name, api_key } = req.body;

    if (!name || !api_key) {
      return res.status(400).json({ error: "Name and api_key are required." });
    }

    const newUser = new User({ name, api_key });
    await newUser.save();

    console.log("User added successfully:", newUser.name);
    res
      .status(201)
      .json({ message: "User added successfully!", user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      console.error("Error adding user: Duplicate API key.");
      return res
        .status(409)
        .json({ error: "A user with this API key already exists." });
    }
    console.error("Error in /admin/users (POST):", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Route to get all users
app.get("/admin/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error in /admin/users (GET):", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Route to delete a user by ID
app.delete("/admin/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await deleteUser(id);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found." });
        }
        console.log("User deleted successfully:", deletedUser.name);
        res.status(200).json({ message: "User deleted successfully!", user: deletedUser });
    } catch (error) {
        console.error("Error in /admin/users (DELETE):", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Route to update a user by ID
app.put("/admin/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, api_key } = req.body;

        if (!name && !api_key) {
            return res.status(400).json({ error: "No fields provided for update." });
        }

        const updates = {};
        if (name) updates.name = name;
        if (api_key) updates.api_key = api_key;

        const updatedUser = await updateUser(id, updates);
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }
        console.log("User updated successfully:", updatedUser.name);
        res.status(200).json({ message: "User updated successfully!", user: updatedUser });
    } catch (error) {
        if (error.code === 11000) {
            console.error("Error updating user: Duplicate API key.");
            return res
                .status(409)
                .json({ error: "A user with this API key already exists." });
        }
        console.error("Error in /admin/users (PUT):", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING AT PORT ${PORT}`);
});