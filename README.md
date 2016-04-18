#WikiMini
##About
WikiMini is a project I began for my Algorithms course with the intent of refining the way we use wikipedia and compress the the pages to minimize the data transferred across requests. Wikipedia pages contain lots of information about any particular subject including many extraneous and unnecessary data, all of which is sent the users device whenever they want to know something about that particular object. Most use cases involve looking for a small piece of information within the sea of encylcopeic knowledge about a particular subject. In this case, the user only needs less than 10% of the content on the page.

The solution to this problem is two fold, the first (1) is refining the process by which you get information from wikipedia and the second (2) is more technical and involves reducing the actual data transmission size using huffman coding compression.

##(1) Refining the Lookup Process

In order to refine the process of looking up information on wikipedia, I split it into three steps. First the user searches for the relevant page on wikipedia which will contain the information they're looking for. Second, the user gets a list of sections from whichever existing wikipedia page they selected during the previous step. Third, the user selects a particular section from the wikipedia page and recieves a stripped version of the text. This is where the compression using huffman coding comes into play, minimizing data transfer sizes.

###The API
To implement this new lookup process I created an API with an endpoint for each step.

#### POST /api/search requires ['termstring' : string]

#### POST /api/getsections requires ['pagename' : string]

#### POST /api/getsection requires ['pagename' : string, 'sectionindex' : string]


##(2) Reducing the size of the request

In order to reduce the the amount of data sent to the client, specifically at step three in the aforementioned process, I used Huffman coding compression on the text retrieved from wikipedia. This requires building a Huffman encoding scheme (or tree structure) for each section processed and then decoding it on the client using a similar process to retrieve the original string. The compression returns a string of binary data which is transmitted from server to client. However, without actually encoding it with something other than US ASCII (the standard for HTTP 1.1), it is only simulating the possibility of reducing the data size, not actually minimizing it. In order to see tangible results, the 1s and 0s must be sent as bits rather than ASCII symbols which are about a byte each in size.

Because creating a custom encoding is unreasonable for the scope of this project, I decided to try to fit as much data into each ASCII symbol as possible. Each ASCII symbol has a numerical representation (i.e. A is decimal 65) which can be translated into bits, so 1000001 would is the equivalent of A. Thus, by splitting up the Huffman encoded strings into 7 bit chunks, each chunk can be aliased as a letter from the US ASCII set. This effectively encodes the binary string while still using the standard US ASCII encoding.

The compressed data, along with a dictionary associating the bit patterns to each character is sent to the client, effectively minimizing the amount of data needed per request.

## Future Works
If I continued working on this project I would implement local caching on devices so clients could relook up the same data without having to use more data. I would also make the Huffman coding compression two way, minimizing data going to and from the client instead of just to the client from the server.

###Resources

####wikipedia api sources
https://en.wikipedia.org/w/api.php
https://en.wikipedia.org/w/api.php?action=help&modules=query
https://en.wikipedia.org/w/api.php?action=help&modules=parse
http://stackoverflow.com/questions/13517901/how-to-use-mediawikis-api-to-get-the-first-section-of-an-article


####cheerio
https://github.com/cheeriojs/cheerio


####general js sources
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log


####general ios source
http://stackoverflow.com/questions/25879837/how-to-display-html-formatted-text-in-ios-label
http://stackoverflow.com/questions/24092884/get-nth-character-of-a-string-in-swift-programming-language
http://stackoverflow.com/questions/25921204/convert-swift-string-to-array


####research links
http://stackoverflow.com/questions/818122/which-encoding-is-used-by-the-http-protocol
http://stackoverflow.com/questions/19212306/whats-the-difference-between-ascii-and-unicode
