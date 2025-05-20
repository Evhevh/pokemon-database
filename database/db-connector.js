// Citation for the following code:
// Date: 5/6/2025
// Copied/Adapted/Based on:
// Source URL: https://canvas.oregonstate.edu/courses/1999601/pages/exploration-web-application-technology-2?module_item_id=25352948

// Get an instance of mysql we can use in the app
let mysql = require('mysql2')

// Create a 'connection pool' using the provided credentials
const pool = mysql.createPool({
    waitForConnections: true,
    connectionLimit   : 10,
    host              : 'classmysql.engr.oregonstate.edu',
    user              : 'cs340_vanhaoe',
    password          : '0322',
    database          : 'cs340_vanhaoe'
}).promise(); // This makes it so we can use async / await rather than callbacks

// Export it for use in our application
module.exports = pool;