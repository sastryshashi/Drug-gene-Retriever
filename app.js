var express = require ("express");
var app = express();

app.set("view engine", "ejs");


// -------------------------
// Routes
// --------------------------
app.get ("/", (req, res) => {
  res.render("Index");
});


//------------------
// Tell express to listen for requests (start server)
//------------------
app.listen (8000, () => {
  console.log("The app server has started");
});
