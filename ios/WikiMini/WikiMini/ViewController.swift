//
//  ViewController.swift
//  WikiMini
//
//  Created by Samuel Hunter on 4/13/16.
//  Copyright © 2016 Samuel Hunter. All rights reserved.
//

import UIKit

class SearchViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    @IBOutlet weak var searchField: UITextField!
    @IBOutlet weak var searchButton: UIButton!
    @IBOutlet weak var resultsTable: UITableView!
    var searchResults : [String]!
    var selectedPage : String!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        resultsTable.dataSource = self
        resultsTable.delegate = self
        searchResults = []
        selectedPage = ""
        // Do any additional setup after loading the view, typically from a nib.
        
        searchButton.addTarget(self, action: "search:", forControlEvents: UIControlEvents.TouchUpInside)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("searchcell", forIndexPath: indexPath)
        cell.textLabel!.text = searchResults[indexPath.row]
        return cell
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return searchResults.count
    }
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let pagename = searchResults[indexPath.row]
        selectedPage = pagename
        
        performSegueWithIdentifier("segueToSectionList", sender: self)
        
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "segueToSectionList" {
            let sectionsVC = segue.destinationViewController as! SectionsViewController
            sectionsVC.pagename = self.selectedPage
            sectionsVC.getsections(self.selectedPage)
        }
    }
    
    func search(sender: UIButton) {
        let data = ["termstring": searchField.text!]
        
        let request = NSMutableURLRequest(URL: NSURL(string: "http://localhost:8080/api/search")!)
        request.HTTPMethod = "POST"
        
        
        do {
            let options = NSJSONWritingOptions()
            request.HTTPBody = try NSJSONSerialization.dataWithJSONObject(data, options: options)
        } catch _ {
            print("can't' encode data to send " + searchField.text!)
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
                
                print(json)
                if let item = json[0] as? [String] {
                    self.searchResults = item
                    dispatch_async(dispatch_get_main_queue(), { () -> Void in
                        self.resultsTable.reloadData()
                    })
                } else {
                    print("is not string array")
                }
            }
        }
        task.resume()
    }


}

