var express = require("express");
var request = require("request");
var app = express();
var bodyParser = require('body-parser');
var cheerio = require("cheerio");
var querystring = require("querystring");
var huffman = require("./huffman_coding");

app.use( bodyParser.json() );

app.post("/api/search", function (req, res) {
  console.log("searching");
  var termstring = req.body.termstring;
  // should look something like this https://en.wikipedia.org/w/api.php?action=opensearch&limit=5&search=chicago
  var termstring_uri_encoded = querystring.stringify({search: termstring});
  var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&limit=5&' + termstring_uri_encoded;
  console.log(url);
  request(url, function (error, response, html) {
    var json_search_results = JSON.parse(response.body);
    if (json_search_results[1].length === 0) {
      res.status(200).send(["NO RESULTS"]);
    } else {
      res.status(200).send([json_search_results[1]]);
    }
  });
});

//requires topic to be sent back
app.post("/api/getsections", function (req, res) {
  console.log("fetching sections");
  var pname = req.body.pagename;
  var pname_encoded = querystring.stringify({page: pname});
  var url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=sections&' + pname_encoded + '&redirects';
  console.log(url);
  request(url, function (error, response, html) {
    var json_section_results = JSON.parse(response.body);
    var sections = json_section_results.parse.sections;
    if (sections !== undefined) {
      var sections_minimized = sections.map(function (obj) {
        var min_obj = {};
        min_obj["level"] = parseInt(obj.level);
        min_obj["index"] = obj.index;
        min_obj["title"] = obj.line;
        return min_obj;
      });

      res.status(200).send([sections_minimized]);
    } else {
      res.status(200).send(["NO SECTIONS FOUND"]);
    }
  });
});

app.post("/api/getsection", function (req, res) {
  console.log("emptying dictionary");
  //huffman.g_huff_dict = {};
  console.log("dictionary emptied");
  console.log("fetching section");
  var sectionindex = req.body.sectionindex;
  var pagename = req.body.pagename;

  var sectionindex_encoded = querystring.stringify({page: pagename, section: sectionindex})

  var url = 'https://en.wikipedia.org/w/api.php?format=json&action=parse&' + sectionindex_encoded + '&prop=text&redirects';
  console.log(url);

  request(url, function (error, response, html) {
    var json_section_text = JSON.parse(response.body);
    var text = json_section_text.parse.text["*"];
    if (text !== undefined) {
      text = text.replace(/<!--[\s\S]*?-->/g, '');
      var $ = cheerio.load(text);
      var pre_stripping_length = $.html().length;

      $('.references').remove();
      $('img').remove();
      $('.thumbcaption').remove();
      $('.mw-editsection-bracket').remove();
      $('.hatnote, .relarticle, .mainarticle').remove();
      $('div').remove();
      $('sup').remove();
      $('a').each(function() {
        if ($(this).text() == 'edit') {
          $(this).remove()
        } else {
          $(this).replaceWith( $(this).text() );
        }
      });

      var test_string = 'This is a real sentence.'
      var post_strip_html = $.html().toLowerCase();
      var post_stripping_length = $.html().length;
      var char_array = huffman.get_chars(post_strip_html);
      var char_counted = huffman.count_chars(char_array);
      var char_counted_length = char_counted.length;
      var sorted_chars = huffman.sort_chars(char_counted);
      var tree_top = huffman.huffman_tree(sorted_chars);
      huffman.create_huffman_dict(tree_top, '', true);
      var huff_string = huffman.create_huffman_string(post_strip_html);
      var inverted_huff_dict = huffman.invert_huffman_dict(huffman.HuffmanSingleton.getInstance().g_huff_dict);
      var json_inv_huff_dict = JSON.stringify(inverted_huff_dict);
      //console.log(huff_string, g_huff_dict);
      var string_back = huffman.read_huffman_string(huff_string, tree_top);

      var compressed_ascii = huffman.strBinConverter.toStr(huff_string);
      console.log("raw string length: ", post_strip_html.length, " huffman coded length: ", huff_string.length);
      console.log("compressed ascii and excess length: ", compressed_ascii[0].length + compressed_ascii[1].length);
      var uncompressed_huffman = huffman.strBinConverter.toBin(compressed_ascii[0], compressed_ascii[1]);
      //console.log("ratio (huffman ascii encoded to raw string): ", (compressed_ascii[0].length + compressed_ascii[1].length)/post_strip_html.length);
      //console.log("test compression/decompression passed: ", uncompressed_huffman == huff_string);

      var string_tree = JSON.stringify(tree_top);
      var huffman_string_tree = huffman.create_huffman_string(string_tree);
      var compressed_ascii_huffman_tree = huffman.strBinConverter.toStr(huffman_string_tree);
      //console.log("decompress dict length: ", JSON.stringify(huffman.invert_huffman_dict(huffman.g_huff_dict)).length);
      console.log("ratio (huffman coded compressed ascii string + char dictionary)/(raw string): ", (compressed_ascii[0].length + compressed_ascii[1].length + json_inv_huff_dict.length)/post_strip_html.length);

      res.status(200).send([compressed_ascii, inverted_huff_dict]);
    } else {
      res.status(200).send(["NO TEXT FOUND FOR SECTION"]);
    }
  });
});

app.get('/', function (req, res, err) {
  res.sendFile( __dirname + "/" + "index.html" );
});

app.use(express.static('public'));
app.listen(8080);
console.log("listening on port 8080");
exports = module.exports = app;
