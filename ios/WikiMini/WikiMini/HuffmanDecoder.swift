//
//  HuffmanDecoder.swift
//  WikiMini
//
//  Created by Samuel Hunter on 4/14/16.
//  Copyright © 2016 Samuel Hunter. All rights reserved.
//

import Foundation

class HuffmanDecoder {
    init() {}
    
    func decode_ascii_compression_to_huff_string(compressed_string : String) -> String {
        var split_ascii = Array(compressed_string.characters)
        var index = 0
        var outstring = ""
        while (index < split_ascii.count) {
            var char = String(split_ascii[index]) 
            let scalars = char.unicodeScalars
            let dec_val = scalars[scalars.startIndex].value
            let bin_val = String(dec_val, radix: 2)
            let bin_string = toBin(bin_val, toSize: 7)
            outstring += bin_string
            
            index += 1
            
        }
        return outstring
    }
    
    func toBin(number : String, toSize: Int) -> String {
        var padded = number
        for _ in 0..<toSize - padded.characters.count {
            padded = "0" + padded
        }
        return padded
    }
    
    func decode_huff_string_dict(huff_string: String, inv_huff_dict : [String: String]) -> String {
        var index = 0
        var huff_string_array = Array(huff_string.characters)
        var t_string = ""
        var outstring = ""
        while index < huff_string_array.count {
            t_string += String(huff_string_array[index])
            if let next_char = inv_huff_dict[t_string] {
                outstring += next_char
                t_string = ""
            }
            index += 1
        }
        return outstring
    }
    
    //deprecated, use above function instead
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
