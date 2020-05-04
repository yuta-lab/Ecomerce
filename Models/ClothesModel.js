  
class ClothesModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS Clothes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT
        )`
        return this.DAO.run(sql)
    }

    add (text, id) {
        return this.DAO.run(
            'INSERT INTO Clothes (text, id) VALUES (?, ?)',
            [text, id]
        );
    }
    
    getAll () {
        return this.DAO.all(
            'SELECT text, id FROM Clothes'
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