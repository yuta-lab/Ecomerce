const UserModel = require("../Models/UserModel");
const argon2 = require("argon2");

class AuthController {
  constructor(dao) {
    this.UserModel = new UserModel(dao);
  }

  async register(username, password) {
    const passwordHash = await this.hashPassword(password);
    this.UserModel.addUser(username, passwordHash);
  }

  async hashPassword(password) {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB (we're limited on how how this can be due to our hardware)
      hashLength: 32, // 32 byte hash (encoded in base64 so it's actually 1/3 longer)
      timeCost: 3, // Takes ~220ms on our machines
      parallelism: 1 // We have 1 core machines so we can't parallelize any more
    });
    return hash;
  }

  // Call this function to authenticate a user using a username and password
  // this function is asynchronous so it returns a promise
  // you need to implement the getPasswordHash() function in the UserModel class
  // these await statements can throw exceptions which we are using to indicate
  // failure. It would be better to define custom exceptions to throw but we'll
  // skip that for now
  async login(username, password) {
    const passwordHash = await this.UserModel.getPasswordHash(username);
    const isVerified = await this.verifyPassword(passwordHash["passwordHash"], password);
    console.log(passwordHash, isVerified);
    return isVerified;
  }

  async verifyPassword(passwordHash, password) {
    return await argon2.verify(passwordHash, password);
  }
}

module.exports = AuthController;
