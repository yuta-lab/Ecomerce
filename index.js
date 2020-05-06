const express        = require('express');
const app            = express();
const path           = require('path');
const createDAO      = require('./Models/dao');
const UserModel      = require('./Models/UserModel');
const ClothesModel   = require('./Models/ClothesModel');
const CartModel      = require('./Models/CartModel');
const AuthController = require('./Controllers/AuthController');
const winston        = require('winston');
const redis          = require('redis');
const session        = require('express-session');
const RedisStore     = require('connect-redis')(session);
const UserController = require('./Controllers/UserController');
var   multer         = require('multer');

const redisClient = redis.createClient();

const sess = session({
    store: new RedisStore({ 
        client: redisClient, // our redis client
        host: 'localhost',   // redis is running locally on our VM (we don't want anyone accessing it)
        port: 6379,          // 6379 is the default redis port (you don't have to set this unless you change port)
        ttl: 12 * 60 * 60,   // Time-To-Live (in seconds) this will expire the session in 12 hours
    }),
    secret: 'yuta-lab web-dev', // Use a random string for this in production
    resave: false, 
    cookie: {
        httpOnly: true,
        // maxAge: 24 * 60 * 60 * 1000  // 24 hours
    },
    saveUninitialized: false, // set this to false so we can control when the cookie is set (i.e. when the user succesfully logs in)
});

// This parses the cookie from client's request
// it parse the cookie before any routes are handled or 
// application middleware kicks in
app.use(sess);
app.set("view engine", "ejs");

/*
        Initialize logger
*/
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json(),
    ),
    transports: [
      new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './logs/info.log' })
    ]
});

const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'clothes.db');
const userDbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'users.db');
const cartDbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'cart.db');
const webshopDbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'webshop.db');


let Clothes = undefined;
let Cart    = undefined;
let Auth   = undefined;

// Gives direct access to GET files from the
// "main" directory (you can name the directory anything)
app.use(express.static('main'));

// We add this to the middleware so it logs every request
// don't do this in production since it will log EVERYTHING (including passwords)
app.use((req, res, next) => {
    logger.info(`${req.ip}|${req.method}|${req.body || ""}|${req.originalUrl}`);
    next();
});

// We need this line so express can parse the POST data the browser
// automatically sends
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const badIPS = {};

app.get('/', (req, res, next) => {
    if (!req.session.name) {
        req.session.name  = req.query.name;
    }
    req.session.views = req.session.views ? req.session.views+1 : 1;
    
    console.log(`current views:`);
    console.log(req.session);
    next();
});

app.use('*', (req, res, next) => {
    if (badIPS[req.ip] >= 10) {
        return res.sendStatus(403);
    }
    next();
});

app.all('/account/:userID/*', (req, res, next) => {
    console.log(req.params)
    if (req.session.isVerified && req.params.userID === req.session.userID) {
        next();
    } else {
        // Rate limiting
        badIPS[req.ip] = badIPS[req.ip] ? badIPS[req.ip]+1 : 1;
        console.log(badIPS);
        res.sendStatus(403); // HTTP 403 Forbidden
    }
});


// Default route : main page
app.get("/", (req, res) => {
    console.log(req.ip);
    res.redirect("/main");
});
app.get("/main", (req, res) => {
    res.sendFile(path.join(__dirname, "/main/html/main.html"));
});

/*
    about page
*/
app.get("/about", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "main", "html", "about.html"));
}));

/*
    shop page
*/
app.get("/shop", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "main", "html", "shop.html"));
}));

/*
    Account Registration
*/
app.get("/sinup", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "main", "html", "sinup.html"));
}));

app.post("/sinup", errorHandler(async (req, res) => {
    const body = req.body;
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    try {
        await Auth.register(username, password);
        // res.sendStatus(200);
        res.redirect("/login");

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(err);
            logger.error(err);
            res.sendStatus(409); // 409 Conflict
        } else {
            throw err;
        }
    }
}));

/*
        User Login
*/
app.get("/login", errorHandler(async (req, res) => {
    if (req.session.isVerified) {
        res.redirect("/webshop");
    } else {
        res.sendFile(path.join(__dirname, "main", "html", "login.html"));
    }
}));

app.post("/login", errorHandler( async (req, res) => {
    if (req.body === undefined || (!req.body.username || !req.body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = req.body;
    const isVerified = await Auth.login(username, password);
    const status = isVerified ? 200 : 401;
    req.session.isVerified = isVerified;
    // TODO: Set the user's ID on their session object
    if (isVerified) {
        req.session.username = username;
        req.session.uuid = await UserController.getUserID(username);
    }
    res.sendStatus(status);
}));

app.post("/logout", (req, res) => {
    if (!req.session.isVerified) {
        alert("Sin in first!");
    } else {
        req.session.destroy(function(err) {
            if (err) return console.log(err);
            res.redirect("main");
        })
    }    
})

/* 
    webshop page
*/
app.get("/webshop", errorHandler(async (req, res) => {
    // res.sendFile(path.join(__dirname, "main", "html", "webshop.html"));
    const message = "Hello World!";
    const rows = await Clothes.getAll();
    console.log(rows)
    res.render("webshop",  {message: message, rows: rows});
}));


/*
    owner (upload) page
*/
app.get("/owner", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "main", "html", "owner.html"));
}));

const upload = multer({ dest: './main/webshop' }).single('Images');
    
app.post('/upload', function(req, res) {
  upload(req, res, function(err) {
    if(err) {
      res.send("Failed to write " + req.file.destination + " with " + err);
    } else {
      Clothes.add(parseInt(req.body.price), req.file.filename);
      res.send("uploaded " + req.file.originalname + " as " + req.file.filename + " Size: " + req.file.size);
    }
  });
});

app.post('/owner', (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.render('index', {
          msg: err
        });
      } else {
        if(req.file == undefined){
          res.render('index', {
            msg: 'Error: No File Selected!'
          });
        } else {
          res.render('index', {
            msg: 'File Uploaded!',
            file: `uploads/${req.file.filename}`
          });
        }
      }
    });
});

/*
    owner (delete) page
*/
app.post("/cloth/delete", errorHandler( async (req, res) => {
    Clothes.delete(req.body.id);
    res.send("success to delete")
}));

/*
    cart page
*/
app.get("/cart", errorHandler(async (req, res) => {
    const user = await Users.getUserID(req.session.username);
    const cartItems = await Cart.getAllClothsByUserUuid(user.uuid);
    console.log(cartItems);
    let subtotal = 0;
    cartItems.forEach(item => subtotal += item.price)
    res.render("cart",  {cartItems: cartItems, subtotal: subtotal});
}));
  
app.post("/cart", errorHandler(async (req, res) => {
    const user = await Users.getUserID(req.session.username);
    req.body.clothIds.forEach(async (clothId) => {
        await Cart.add(user.uuid, parseInt(clothId));
    });
    res.redirect("/cart");
}));

// app.get("/cart", errorHandler(async (req, res) => {
//     if (req.session.isVerified) {

//     } else {
//     res.sendFile(path.join(__dirname, "main", "html", "cart.html"));
//     }
// }));

 
// app.post("/cart", errorHandler( async (req, res) => {
//     const anything = document.getElementById("anything").value;
//     const nothing = document.getElementById("nothing").value;

//     if (req.body === undefined) {
//         //what shoud be gotten
//         res.write(nothing);
//     }
//     else{
//         res.write(anything);
//     }
// }));


// Listen on port 80 (Default HTTP port)
app.listen(80, async () => {
    // wait until the db is initialized and all models are initialized
    await initDB();
    // Then log that the we're listening on port 80

    console.log("Listening on port 80.");
});

/*
    create database
*/
async function initDB() {
    // const dao = await createDAO(dbFilePath);
    // const userDao = await createDAO(userDbFilePath);
    // const cartDao = await createDAO(cartDbFilePath);
    const dao = await createDAO(webshopDbFilePath);


    Clothes = new ClothesModel(dao);
    await Clothes.createTable();
    Cart = new CartModel(dao);
    await Cart.createTable()
    Users = new UserModel(dao);
    await Users.createTable();
    Auth = new AuthController(dao);
}

// This is our default error handler (the error handler must be last)
// it just logs the call stack and send back status 500
app.use(function (err, req, res, next) {
    console.error(err.stack)
    logger.error(err);
    res.redirect('/error');
});

// We just use this to catch any error in our routes so they hit our default
// error handler. We only need to wrap async functions being used in routes
function errorHandler (fn) {
    return function(req, res, next) {
      return fn(req, res, next).catch(next);
    };
};