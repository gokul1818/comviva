//import UIKit
//import React
//import Firebase
//
//@main
//class AppDelegate: RCTAppDelegate {
//  override func application(
//    _ application: UIApplication,
//    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
//  ) -> Bool {
//    
//    // Configure Firebase first
//    FirebaseApp.configure()
//    
//    self.moduleName = "comviva"
//    self.dependencyProvider = RCTAppDependencyProvider()
//    self.initialProps = [:]
//
//    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
//  }
//
//  override func sourceURL(for bridge: RCTBridge) -> URL? {
//    return self.bundleURL()
//  }
//
//  override func bundleURL() -> URL? {
//#if DEBUG
//    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
//#else
//    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
//#endif
//  }
//}
import UIKit
import React
import Firebase

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    FirebaseApp.configure()

    let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
    let rootView = RCTRootView(bridge: bridge!, moduleName: "comviva", initialProperties: nil)
    let rootViewController = UIViewController()
    rootViewController.view = rootView

    self.window = UIWindow(frame: UIScreen.main.bounds)
    self.window?.rootViewController = rootViewController
    self.window?.makeKeyAndVisible()

    return true
  }
}

extension AppDelegate: RCTBridgeDelegate {
  func sourceURL(for bridge: RCTBridge!) -> URL! {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
