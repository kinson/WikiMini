var express = require("express");
var request = require("request");
var app = express();
var bodyParser = require('body-parser');
var cheerio = require("cheerio");
var querystring = require("querystring");

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
      var char_array = get_chars(post_strip_html);
      var char_counted = count_chars(char_array);
      var char_counted_length = char_counted.length;
      var sorted_chars = sort_chars(char_counted);
      var tree_top = huffman_tree(sorted_chars);
      create_huffman_dict(tree_top, '', []);
      var huff_string = create_huffman_string(post_strip_html);
      //console.log(huff_string, g_huff_dict);
      var string_back = read_huffman_string(huff_string, tree_top);

      var compressed_ascii = strBinConverter.toStr(huff_string);
      console.log("raw string length: ", post_strip_html.length);
      console.log("compressed ascii and excess length: ", compressed_ascii[0].length + compressed_ascii[1].length);
      var uncompressed_huffman = strBinConverter.toBin(compressed_ascii[0], compressed_ascii[1]);
      console.log("ratio (huffman ascii encoded to raw string): ", (compressed_ascii[0].length + compressed_ascii[1].length)/post_strip_html.length);
      console.log("test compression/decompression passed: ", uncompressed_huffman == huff_string);

      var string_tree = JSON.stringify(tree_top);
      var huffman_string_tree = create_huffman_string(string_tree);
      var compressed_ascii_huffman_tree = strBinConverter.toStr(huffman_string_tree);
      console.log("key length (non-huffman): ", string_tree.length, "content length: ", huff_string.length);
      console.log("huffman tree key compressed length: ", compressed_ascii_huffman_tree[0].length);


      // var nbits = Math.ceil(Math.log(char_counted_length)/Math.log(2));
      // var nbitencodinglength = post_strip_html.length*nbits;
      // console.log("\n\nn bits needed for encoding " + char_counted_length  + " different chars: ", nbits);
      // console.log("n-bit encoding length: ", nbitencodinglength);
      // console.log("huffman encoding length: ", huff_string.length);
      // console.log("ratio (huffman to 5-bit): ", huff_string.length/nbitencodinglength);
      res.status(200).send([huff_string, tree_top]);
    } else {
      res.status(200).send(["NO TEXT FOUND FOR SECTION"]);
    }
  });
});

var get_chars = function(html_string) {
  return html_string.split("");
}

var count_chars = function(char_array) {
  var chars = [];
  var count_chars = [];
  for (var i = 0; i < char_array.length; i++) {
    var index = chars.indexOf(char_array[i]);
    if (index > -1) {
      count_chars[index] += 1;
    } else {
      count_chars.push(1);
      chars.push(char_array[i]);
    }
  }
  return chars.map(function (val, index, array) {
    return {'char' : val, 'count' : count_chars[index]}
  });
}

var sort_chars = function(char_count_array) {
  var sorted = char_count_array.sort(function (a, b) {
    return a.count - b.count;
  });
  return sorted;
}

var huffman_tree = function(chars) {
  if (chars.length == 2) {
    var node_a = chars[0];
    var node_b = chars[1];
    var new_node = {
      'char' : node_a.char + node_b.char,
      'count' : node_a.count + node_b.count,
      'left' : node_a,
      'right' : node_b
    };
    //console.log("exiting huffman tree function");
    return new_node;
  } else {
    var node_a = chars[0];
    var node_b = chars[1];
    var new_node = {
      'char' : node_a.char + node_b.char,
      'count' : node_a.count + node_b.count,
      'left' : node_a,
      'right' : node_b
    };
    //console.log("again ", chars);
    chars.splice(0, 2, new_node);
    return huffman_tree(sort_chars(chars));
  }
}

var create_huffman_dict = function(tree_top, path) {
  if (tree_top.left !== undefined) {
    create_huffman_dict(tree_top.left, path + '0');
    create_huffman_dict(tree_top.right, path + '1');
  } else {
    //var new_path = {'char' : tree_top.char, 'path' : path};
    g_huff_dict[tree_top.char] = path;
  }
}

var create_huffman_string = function(instring) {
  var outstring = '';
  var instring_array = instring.split('');
  for (var i = 0; i < instring_array.length; i++) {
    outstring += g_huff_dict[instring_array[i]];
  }
  return outstring;
}

//use to convert between huffman_string and ascii representation
var strBinConverter = {
	toStr : function(bin) {
		var str = bin.match(/[01]{7}/g).map(function (v) {
			return String.fromCharCode(parseInt(v, 2));
		}).join("");
		if (bin.length % 7 !== 0) {return [str, bin.slice(-1*(bin.length % 7))]}
		else {return [str, ''];}
	},
	toBin: function(str, extra) {
		var bin = str.split('').map(function(v) {
			var bs = v.charCodeAt(0).toString(2);
			return "0000000".slice(bs.length) + bs;
		}).join("");
    if (!extra) {
      return bin;
    } else {
      return bin + extra;
    }
	},
}

var read_huffman_string = function(huffman_string, tree_top) {
  var dig = '';
  var c_node = tree_top;
  var index = 0;
  var outstring = '';
  var huffman_string_array = huffman_string.split('');
  while (index <= huffman_string_array.length) {
    //console.log(dig, outstring, c_node.char);
    if (c_node.left === undefined) {
      outstring += c_node.char;
      c_node = tree_top;
    } else {
      dig = huffman_string_array[index];
      if (dig === '0') {
        c_node = c_node.left;
      } else if (dig === '1') {
        c_node = c_node.right;
      }
      index += 1;
    }
  }
  return outstring;
}

app.get('/', function (req, res, err) {
  res.sendFile( __dirname + "/" + "index.html" );
});

var g_huff_dict = {};
app.use(express.static('public'));
app.listen(8080);
console.log("listening on port 8080");
exports = module.exports = app;
