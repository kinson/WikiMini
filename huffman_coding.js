// var huff = {
//   g_huff_dict : {},
//   empty : function () {this.g_huff_dict = {};}
// };

var HuffmanSingleton = (function () {
  var instance;

  function createInstance() {
        return {
          g_huff_dict : {},
          empty : function() {
            g_huff_dict = {};
          }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
g_inverted_huff_dict = {};

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

var create_huffman_dict = function(tree_top, path, empty) {
  if (empty === true) {console.log("called");HuffmanSingleton.getInstance().empty();}
  if (tree_top.left !== undefined) {
    create_huffman_dict(tree_top.left, path + '0', false);
    create_huffman_dict(tree_top.right, path + '1', false);
  } else {
    //var new_path = {'char' : tree_top.char, 'path' : path};
    HuffmanSingleton.getInstance().g_huff_dict[tree_top.char] = path;
  }
}

var invert_huffman_dict = function(huff_dict) {
  var invdict = {}
  for (var hkey in huff_dict) {
    if (huff_dict.hasOwnProperty(hkey)) {
      invdict[huff_dict[hkey]] = hkey;
    }
  }
  return invdict;
}

var create_huffman_string = function(instring) {
  var outstring = '';
  var instring_array = instring.split('');
  for (var i = 0; i < instring_array.length; i++) {
    outstring += HuffmanSingleton.getInstance().g_huff_dict[instring_array[i]];
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

module.exports = {
  count_chars : count_chars,
  get_chars : get_chars,
  sort_chars : sort_chars,
  huffman_tree : huffman_tree,
  create_huffman_dict : create_huffman_dict,
  create_huffman_string : create_huffman_string,
  invert_huffman_dict : invert_huffman_dict,
  read_huffman_string : read_huffman_string,
  strBinConverter : strBinConverter,
  HuffmanSingleton : HuffmanSingleton,
  g_inverted_huff_dict : g_inverted_huff_dict
};
