const express     = require ("express"),
      app         = express(),
      request     = require("request"),
      bodyParser  = require("body-parser"),
      convert     = require('xml-js');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// -------------------------
// Routes
// --------------------------

//Homepage
app.get ("/", (req, res) => {
  res.render("Index");
});


//Search results page
app.get ("/searchResults", (req, res) => {
  //var searchTerm = req.body.searchTerm;
  var searchTerm = req.query.searchTerm;
  console.log("Value of search term is " + searchTerm);
  request ("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=cancer&retmax=20",
  (err, response, body) => {
    if (err) {
        res.send ("There was an error");
        console.log (err);
    } else if (response.statusCode == 200) {
        var xml = convert.xml2json(body);
        var json = JSON.parse(xml);
        res.send(json.elements[1].elements[3].elements);
        // res.send(JSON.parse(xml));
    }
  });
});

//------------------
// Tell express to listen for requests (start server)
//------------------
app.listen (8000, () => {
  console.log("The app server has started");
});
