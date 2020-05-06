class CartModel {
    constructor(DAO) {
      this.DAO = DAO
    }
  
    createTable() {
        const sql = `
          CREATE TABLE IF NOT EXISTS carts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_uuid TEXT NOT NULL,
          cloth_id INTEGER NOT NULL
        )`
        return this.DAO.run(sql)
    }
  
    add(userUuid, clothId) {
      return this.DAO.run(
        'INSERT INTO carts (user_uuid, cloth_id) VALUES (?, ?)',
        [userUuid, clothId]
      );
    }
  
    getAllClothsByUserUuid(userUuid) {
        return this.DAO.all(`
        SELECT Clothes.* FROM carts
        INNER JOIN Clothes ON Clothes.id = carts.cloth_id
        WHERE carts.user_uuid = ?
        `,[userUuid]
      );
    }
  
  
    delete(id) {
      return this.DAO.all(
        "delete from carts where id = ?",
        [id]
      )
    }
  }
  
  module.exports = CartModel;