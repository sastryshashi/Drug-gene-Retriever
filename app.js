const express     = require ("express"),
      app         = express(),
      request     = require("request"),
      rp          = require ("request-promise"),
      bodyParser  = require("body-parser"),
      convert     = require('xml-js'),
      DOMParser   = require('xmldom').DOMParser;

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
  var apiPath = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + searchTerm + "+gene+pharmaceutical" + "&retmax=2";
  request (apiPath, (err, response, body) => {
    if (err) {
        res.send ("There was an error");
        console.log (err);
    } else if (response.statusCode == 200) {
        ids = extractIDs(body);
        getDataFromIDs (res, ids);
    }
  });
});

function extractIDs (body) {
  var jsonString, json, idElements, ids = [];
  jsonString = convert.xml2json(body);
  json = JSON.parse(jsonString);
  idElements = json.elements[1].elements[3].elements;
  //try using the map function here
  idElements.forEach((element) => {
    ids.push(element.elements[0].text);
  });
  return ids;
}

function getDataFromIDs (res, ids) {
  let promises = ids.map(id => getArticleDetails(id));
  Promise.all(promises)
  .then(values => {
    res.render("searchResults", {values: values});
  })
  .catch (err => console.error ("Error: ", err));
}

/*
This is a temporary function to test retrieval of {title: title, abstract: abstract} from getArticleDetails(id).
*/
app.get ("/idsTest", (req, res) => {
  // var ids = ["30145211", "30128536", "30086764", "30079159", "30015382", "30006610", "29976630", "29973717", "29873142", "29844838", "29785153",
  //            "29731985", "29727754", "29713086", "29649003", "29580810", "29559847", "29545475", "29414022", "29214031"];
  var ids = ['31011939', '31011918'];
  let promises = ids.map(id => getArticleDetails(id));
  Promise.all(promises)
  .then(values => {
    res.send(values);
  })
  .catch (err => console.error ("Error: ", err));
});

// Works for 1 id
app.get ("/idTest", (req, res) => {
  let successCallback = function (entry) {
    res.send (entry);
  }
  getArticleDetails ('30015382').then (successCallback);
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
      var doc = new DOMParser().parseFromString (body, 'text/xml');
      abstract = (doc.documentElement.getElementsByTagName("AbstractText")[0].childNodes[0].data);
      title = (doc.documentElement.getElementsByTagName("ArticleTitle")[0].childNodes[0].data);
    })
    .catch ((err) => {
      console.log ("Could not retrieve something for " + id);
    });
  return {title: title, abstract: abstract};
}


//------------------
// Tell express to listen for requests (start server)
//------------------
app.listen (8000, () => {
  console.log("The app server has started");
});
