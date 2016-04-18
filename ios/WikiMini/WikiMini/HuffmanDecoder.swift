//
//  HuffmanDecoder.swift
//  WikiMini
//
//  Created by Samuel Hunter on 4/14/16.
//  Copyright © 2016 Samuel Hunter. All rights reserved.
//

import Foundation

class HuffmanDecoder {
    init() {
        print("initted")
    }
    
    func decode_huff_string(huff_string: String, huff_tree: AnyObject) -> String {
        var digit : Character
        var c_node = huff_tree
        var index = 0
        var outstring = ""
        let char_len = huff_string.characters.count
        var test = 0
        var huff_string_array = Array(huff_string.characters)
        
        while (index <= char_len) {
            if c_node.objectForKey("left") != nil {
                if index == char_len {
                    break
                }
                digit = huff_string_array[index]
                if digit == "0" {
                    c_node = c_node["left"]!!
                } else if digit == "1" {
                    c_node = c_node["right"]!!
                }
                index += 1
            } else {
                test += 1
                outstring += c_node["char"] as! String
                c_node = huff_tree
            }
        }
        print(char_len, test, outstring.characters.count)
        return outstring
    }
}
