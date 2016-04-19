//
//  SectionTextViewController.swift
//  WikiMini
//
//  Created by Samuel Hunter on 4/14/16.
//  Copyright © 2016 Samuel Hunter. All rights reserved.
//

import Foundation
import UIKit

class SectionTextViewController : UIViewController {
    
    @IBOutlet weak var sectionText: UITextView!
    var sectionString: String!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        sectionString = ""
        sectionText.editable = false
    }
    
    func getsectiontext(page: String, section: Int) {
        let data = ["pagename" : page, "sectionindex" : section]
        print(data)
        
        let request = NSMutableURLRequest(URL: NSURL(string: "http://localhost:8080/api/getsection")!)
        request.HTTPMethod = "POST"
        
        do {
            let options = NSJSONWritingOptions()
            request.HTTPBody = try NSJSONSerialization.dataWithJSONObject(data, options: options)
        } catch _ {
            print("can't' encode data to send " + page)
        }
        
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let task = NSURLSession.sharedSession().dataTaskWithRequest(request) { (data, res, error) -> Void in
            if let err = error {
                print(err)
            } else {
                var json = []
                do {
                    json = try NSJSONSerialization.JSONObjectWithData(data!, options: NSJSONReadingOptions()) as! NSArray
                } catch {
                    print(error)
                }
                
                if let ascii_string = json[0] as? [String] {
                    let huff_tree = json[1] as! [String: String]
                    let huffdecoder = HuffmanDecoder()
                    print(ascii_string[0])
                    let huff_string = huffdecoder.decode_ascii_compression_to_huff_string(ascii_string[0]) + ascii_string[1]
                    print(huff_string)
                    var decoded_string = huffdecoder.decode_huff_string_dict(huff_string, inv_huff_dict: huff_tree)
                    print("decoded string", decoded_string)
                    decoded_string = decoded_string.stringByReplacingOccurrencesOfString("\n\n\n\n\n", withString: "")
                    
                    let attrString : NSMutableAttributedString!
                    do {
                        attrString = try NSMutableAttributedString(data: decoded_string.dataUsingEncoding(NSUnicodeStringEncoding)!,
                            options: [NSDocumentTypeDocumentAttribute: NSHTMLTextDocumentType],
                            documentAttributes: nil)
                        attrString.addAttribute(NSFontAttributeName, value: UIFont(name: "Helvetica", size: 18.0)!, range: NSMakeRange(0, attrString.length))

                    } catch {
                        attrString = NSMutableAttributedString()
                        print(error)
                    }
                    
                    
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.sectionText.attributedText = attrString
                    })
                    
                } else {
                    print("cannot convert huffstring to string")
                }
                
            }
        }
        
        task.resume()
    }
}
