const express     = require ("express"),
      app         = express(),
      routes      = require('./router'),
      path        = require('path');

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

app.get ("/", (req, res) => {
  res.render("Index");
});

app.use('/searchResults', routes);

//------------------
// Tell express to listen for requests (start server)
//------------------
app.listen (process.env.PORT || 8000, () => {
  console.log("The app server has started");
});
