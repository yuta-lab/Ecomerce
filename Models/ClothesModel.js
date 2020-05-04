  
class ClothesModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS Clothes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            price INTEGER,
            image_url TEXT
        )`
        return this.DAO.run(sql)
    }

    add (price, imageUrl) {
        return this.DAO.run(
            'INSERT INTO Clothes (price, image_url) VALUES (?, ?)',
            [price, imageUrl]
        );
    }
    
    getAll () {
        return this.DAO.all(
            'SELECT price, id, image_url FROM Clothes'
        );
    }

    delete(id) {
        return this.DAO.all(
            "delete from Clothes where id = ?",
            [id]
          )
    }
    
}
  
module.exports = ClothesModel;