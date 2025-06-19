import User from './user.model.js';

/**
 * Fetches summaries from the WakaTime API for all users in the database.
 * @param {string} range - The time range for the summary (e.g., "Today", "Last_7_Days").
 * @returns {Promise<Array<object>>} A promise that resolves to an array of objects, 
 * each containing a user's name and their coding time.
 */
export const getWakaTimeSummaries = async (range) => {
    try {

        const users = await User.find({});

        if (!users.length) {
            console.log("No users found in the database.");
            return [];
        }

        const headersForKey = (key) => ({
            Authorization: `Basic ${Buffer.from(key).toString("base64")}`
        });

  
      const requests = await Promise.all(users.map(async (user) => {
    const url = `https://wakatime.com/api/v1/users/current/summaries?range=${range}`;

    try {
        const response = await fetch(url, { headers: headersForKey(user.api_key) });
        const json = await response.json();
     
        if(range === "Last_7_Days"){
              return {
            name: user.name,
            time: json.cumulative_total?.text ?? "No Data Found",
            seconds: json.cumulative_total?.seconds ?? "No Data Found"
        };
        }
        return {
            name: user.name,
            time: json.data?.[0]?.grand_total?.text ?? "No Data Found",
            seconds: json.data?.[0]?.grand_total?.total_seconds ?? "No Data Found"
        };
    } catch (err) {
        return {
            name: user.name,
            time: "Error fetching data"
        };
    }
}));


        const results = await Promise.all(requests);
        return results;

    } catch (error) {
        console.error("An error occurred while fetching WakaTime summaries:", error.message);
 
        return [];
    }
};


export const getAllUsers = async () => {
    try {
        const users = await User.find({});
        return users;
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        return [];
    }
};

/**
 * Deletes a user from the database by ID.
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<object>} A promise that resolves to the deleted user object, or null if not found.
 */
export const deleteUser = async (id) => {
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        return deletedUser;
    } catch (error) {
        console.error("Error deleting user:", error.message);
        throw error;
    }
};

/**
 * Updates a user's data in the database by ID.
 * @param {string} id - The ID of the user to update.
 * @param {object} updates - An object containing the fields to update (e.g., { name: "New Name" }).
 * @returns {Promise<object>} A promise that resolves to the updated user object, or null if not found.
 */
export const updateUser = async (id, updates) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error.message);
        throw error;
    }
};
