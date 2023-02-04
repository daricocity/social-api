const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path  = require("path");
const cors = require('cors');

// CORS
const corsOptions ={
    origin:'https://shocia.netlify.app', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

// ROUTES
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const messageRoute = require("./routes/messages");
const conversationRoute = require("./routes/conversations");

dotenv.config();

// DATABASE
const username = process.env.DB_USERNAME;
const pswd = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;
const dbname = process.env.DB_NAME;
const dbURL = `mongodb+srv://${username}:${pswd}@${cluster}.6putb.mongodb.net/${dbname}?retryWrites=true&w=majority`;
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,})
.then(res => console.log("DB Connected successfully"))
.catch(err => console.log(err))

app.use("/images", express.static(path.join(__dirname, "public/images")));

// MIDDLEWARE
app.use(express.json()) // Body parser for post request
app.use(helmet());
app.use(morgan("common"));

// IMAGE UPLOAD
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});
const upload = multer({storage:storage});
app.post("api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("file uploaded successfully.");
    } catch (err) {
        console.log(err);
    }
});

// PATHS
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

app.listen(process.env.PORT || 8800, () => {
    console.log('Backend server is runnning!');
});
