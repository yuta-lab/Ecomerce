
const upload = multer({ dest: './uploads/' }).single('Images');

app.post('/upload', function(req, res) {
  upload(req, res, function(err) {
    if(err) {
      res.send("Failed to write " + req.file.destination + " with " + err);
    } else {
      res.send("uploaded " + req.file.originalname + " as " + req.file.filename + " Size: " + req.file.size);
    }
    ClothesModel.create(req.body.id, req.body.type, req.file.filename)
  });
});
