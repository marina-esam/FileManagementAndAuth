// Import the Mongoose library to interact with MongoDB
const mongoose = require("mongoose");

// Create a function responsible for connecting to the database
const dbConnection = () => {
    // Start the connection process using the database URL stored in the .env file
    mongoose
        .connect(process.env.DB_URL)

        // This block runs if the connection is successful
        .then((conn) => {
            // Print a success message along with the database host name
            console.log(`Database connected: ${conn.connection.host}`);
        })

        // This block runs if the connection fails
        .catch((err) => {
            // Print an error message and the reason for the failure
            console.log("Database connection failed", err);
        });
};

// Export the function so it can be used in other files
module.exports = dbConnection;