//
//  ViewController.swift
//  PopRush
//
//  Created by Jonic Linley on 12/02/2015.
//  Copyright (c) 2015 100yen. All rights reserved.
//

import UIKit
import WebKit
import Foundation

class ViewController: UIViewController, WKScriptMessageHandler {

    @IBOutlet var containerView : UIView! = nil

    var webView: WKWebView?

    override func loadView() {
        super.loadView()

        let contentController = WKUserContentController()

        contentController.addScriptMessageHandler(
            self,
            name: "callbackHandler"
        )

        let config = WKWebViewConfiguration()

        config.userContentController = contentController

        self.webView = WKWebView(
            frame: self.containerView.bounds,
            configuration: config
        )

        self.view = self.webView!
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        let url = NSBundle.mainBundle().URLForResource("WebApp/index", withExtension: "html")
        let req = NSURLRequest(URL:url!)

        self.webView!.loadRequest(req)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

    override func prefersStatusBarHidden() -> Bool {
        return true
    }

    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        if (message.name == "callbackHandler") {
            print(message.body)
        }
    }
    
}
