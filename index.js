const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const indicative = require("indicative").validator;
const Message = require("./models/message");

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const multer = require("multer");
const PORT = process.env.PORT || 8006;
const app = express();
const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
  cors: {},
  maxHttpBufferSize: 1e8,
});
const { writeFile } = require("fs");

const mongo_url =
  process.env.DEV_MODE == "true"
    ? process.env.MONGODB_URL_DEV
    : process.env.MONGODB_URL;

mongoose
  .connect(mongo_url)
  .then(() => console.log("DB connectied to", mongo_url));

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//Data sanitization against NOSQL query injection and xss
app.use(mongoSanitize(), xss());

//Prevents parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
app.use(multer({ storage: storageConfig }).any());
app.use("/images", express.static(__dirname + "/uploads"));

socketIO.on("connection", (socket) => {
  console.log("🔥: A user connected");

  socket.on("newMessage", async (data) => {
    const senddata = {
      from: data.from,
      to: data.to,
      subject: data.subject == undefined ? '' : data.subject,
      content: data.content,
      media: data.filenamelist == undefined ? [] : data.subject,
      link: data.link == undefined ? [] : data.subject,
    };
    await indicative.validate(
      { from: data.from, to: data.to },
      {
        from: "required|email|min:1",
        to: "required|email|min:1",
      }
    );

    if(data.medialist != undefined){
      await Promise.all(
        data.medialist.map(async (item, i) => {
          await writeFile(
            __dirname + "/uploads/" + data.filenamelist[i],
            item,
            (err) => {}
          );
        })
      );
    }
    const message = await Message.create(senddata);

    socketIO.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

app.use("/api/v1", require("./routes/api-router"));

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
// app.listen(PORT, () => console.log(`The server is running on PORT ${PORT}`));
