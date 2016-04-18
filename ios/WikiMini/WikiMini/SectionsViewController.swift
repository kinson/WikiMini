//
//  SectionsViewController.swift
//  WikiMini
//
//  Created by Samuel Hunter on 4/14/16.
//  Copyright © 2016 Samuel Hunter. All rights reserved.
//

import Foundation
import UIKit

class SectionsViewController : UIViewController, UITableViewDelegate, UITableViewDataSource {
    
    @IBOutlet weak var sectionsTable: UITableView!
    var pagename : String!
    var sections : [AnyObject]!
    
    var selectedSection : Int!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        sections = []
        selectedSection = 0
        sectionsTable.dataSource = self
        sectionsTable.delegate = self
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return sections.count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("sectioncell", forIndexPath: indexPath)
        
        let section = sections[indexPath.row]
        let level = section["level"] as! Int
        var titleString = ""
        for _ in 0...level-2 {
            titleString += "    "
        }
        titleString += section["title"] as! String
        cell.textLabel?.text = titleString
        return cell
    }
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let sectionindex = sections[indexPath.row]["index"] as! String
        
        self.selectedSection = Int(sectionindex)
        performSegueWithIdentifier("segueToSection", sender: self)
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "segueToSection" {
            let destVC = segue.destinationViewController as! SectionTextViewController
            destVC.getsectiontext(self.pagename, section: self.selectedSection)
        }
    }
    
    func getsections(page: String) {
        let data = ["pagename" : page]
        
        let request = NSMutableURLRequest(URL: NSURL(string: "http://localhost:8080/api/getsections")!)
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
                
                if let item = json[0] as? [AnyObject] {
                    self.sections = item
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.sectionsTable.reloadData()
                    })
                    
                } else {
                    print("is not object array")
                }

            }
        }
        
        task.resume()
    }
}