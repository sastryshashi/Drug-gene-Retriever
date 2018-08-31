const express     = require ("express"),
      app         = express(),
      request     = require("request"),
      rp          = require ("request-promise"),
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
  var searchTerm = req.query.searchTerm;
  var apiPath = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + searchTerm + "+gene+pharmaceutical" + "&retmax=20";
  request (apiPath, (err, response, body) => {
    if (err) {
        res.send ("There was an error");
        console.log (err);
    } else if (response.statusCode == 200) {
        var jsonString, json, idElements, ids = [];
        jsonString = convert.xml2json(body);
        json = JSON.parse(jsonString);
        idElements = json.elements[1].elements[3].elements;
        //try using the map function here
        idElements.forEach((element) => {
          ids.push(element.elements[0].text);
        });
        res.send(ids);
    }
  });
});


/*
This is a temporary function to test retrieval of {title: title, abstract: abstract} from getArticleDetails(id).
*/
app.get ("/idsTest", (req, res) => {
  var ids = ["30145211", "30128536", "30086764", "30079159", "30015382", "30006610", "29976630", "29973717", "29873142", "29844838", "29785153",
              "29731985", "29727754", "29713086", "29649003", "29580810", "29559847", "29545475", "29414022", "29214031"];
  var listOfEntries = [], entry;
  ids.forEach (async (id) => {
    entry = await getArticleDetails(id);
    listOfEntries.push(entry)
  });
  setTimeout((function() {res.send(listOfEntries)}), 2000);
});

/*
  Given an id input, it returns {title: title, abstract: abstract} for that id.
*/
async function getArticleDetails (id) {
  var apiPath = "http://www.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + id +"&rettype=abstract&retmode=XML";
  var title, abstract;

  await rp (apiPath)
    .then ((body) => {
      var jsonString, json;
      jsonString = convert.xml2json(body);
      json = JSON.parse(jsonString);
      title = (json.elements[1].elements[0].elements[0].elements[2].elements[1].elements[0].text);
      (json.elements[1].elements[0].elements[0].elements[2].elements).forEach ((entry) => {
        if (entry.name == "Abstract")
          abstract = entry.elements[0].elements[0].text;
      });
    })
    .catch ((err) => {
      console.log ("Could not retrieve something");
    });

    return {title: title, abstract: abstract};
}

//------------------
// Tell express to listen for requests (start server)
//------------------
app.listen (8000, () => {
  console.log("The app server has started");
});
