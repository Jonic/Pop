//
//  ViewController.swift
//  Pop
//
//  Created by Jonic Linley on 07/12/2014.
//  Copyright (c) 2014 Jonic Linley. All rights reserved.
//

import UIKit
import WebKit
import Foundation

class ViewController: UIViewController, WKScriptMessageHandler {

    @IBOutlet var containerView : UIView! = nil

    var webView: WKWebView?

    override func loadView() {
        super.loadView()

        var contentController = WKUserContentController()

        contentController.addScriptMessageHandler(
            self,
            name: "callbackHandler"
        )

        var config = WKWebViewConfiguration()

        config.userContentController = contentController

        self.webView = WKWebView(
            frame: self.containerView.bounds,
            configuration: config
        )

        self.view = self.webView!
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        var url = NSBundle.mainBundle().URLForResource("WebApp/index", withExtension: "html")
        var req = NSURLRequest(URL:url!)

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
            println(message.body)
        }
    }

}

