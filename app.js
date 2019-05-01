const express     = require ("express"),
      app         = express(),
      routes      = require('./router');

app.set("view engine", "ejs");

app.get ("/", (req, res) => {
  res.render("Index");
});

app.use('/searchResults', routes);

//------------------
// Tell express to listen for requests (start server)
//------------------
app.listen (8000, () => {
  console.log("The app server has started");
});
