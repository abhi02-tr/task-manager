const express = require("express");
const morgan = require("morgan");
require("./db/mongoose");

const userRouter = require("./routes/user.js");
const taskRouter = require("./routes/task.js");

const app = express();
const PORT = process.env.PORT;

// To stop all services
// app.use((req, res, next) => {
//   res.status(503).json({ message: "Site is in maintenance." });
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);

// error handling
app.use((error, req, res, next) => {
  res
    .status(error.status ?? 400)
    .json({ error: error.message ?? "Some error occouring." });
});

app.listen(PORT, () => {
  console.log(`server is listening..`);
});
