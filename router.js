const express     = require ('express'),
      app         = express(),
      router      = express.Router(),
      request     = require("request"),
      rp          = require ("request-promise"),
      bodyParser  = require("body-parser"),
      convert     = require('xml-js'),
      DOMParser   = require('xmldom').DOMParser,
      mongoose    = require('mongoose');

app.set("view engine", "ejs");
mongoose.connect('mongodb://localhost/drugGene', {useNewUrlParser: true});

// SCHEMA SETUP
var geneSchema = new mongoose.Schema({ name: String });

var geneModel = mongoose.model('Gene', geneSchema);

// geneModel.create (
//   {
//     name: 'enzyme'
//   }, function (err, gene) {
//     if (err) {console.log (err);}
//     else {console.log("NEWLY ADDED GENE: " + gene);}
//   }
// );

// geneModel.find({}, 'name', function (err, genes) {
//   if (err) console.log ("There has been an error");
//   else console.log (genes);
// });

async function getGeneNames () {
  var results = await geneModel.find();
  var geneNames = [];
  results.forEach (gene => {
    geneNames.push(gene.name);
  });
  return geneNames;
}

var geneNames;
getGeneNames()
.then (val => { geneNames = val; });
setTimeout (() => { console.log (geneNames); }, 3000);

//Search results page
router.get ("/", (req, res) => {
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
  let bleh = "asdf";
  Promise.all(promises)
  .then(values => {
    res.render("searchResults", {values: values, geneNames: geneNames});
  })
  .catch (err => console.error ("Error: ", err));
}

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

module.exports = router
