const UserModel = require('../Models/UserModel');
const createDAO = require('../Models/dao');
const path      = require('path');

const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'clothes.db');

exports.getUserID = async function (username) {
    const dao = await createDAO(dbFilePath);
    const userModel = new UserModel(dao);
    return await userModel.getUserId(username);

}

// exports.deleteUser = async (userID) => {
//     console.log(`delete user: ${userID}`);
// }

// exports.updateUsername = async (userID, username) => {
//     console.log(`update ${userID} name to ${username}`);
// }