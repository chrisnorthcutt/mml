function i_browser_get_info() {
	var ie_browser = i_browser_ie_check();
    var browser_info = navigator.userAgent.toLowerCase();
	var info = {device: "desktop", browser: "unknown", version: ""};
	
	if (ie_browser.verIE) {
		info.browser = "msie";
		info.version = ie_browser.verIE;
	}
	else {
	    if (browser_info.indexOf("ipad") >= 0) 
	    {
	    	info.device 	= "ipad";
	    	info.browser	= "safari";
	    }
	    else if (browser_info.indexOf("iphone") >= 0)
	    {
	        info.device 	= "iphone";
	        info.browser	= "safari";
	    }
	    else if (browser_info.indexOf("android") >= 0)
	    {
	        info.device 	= "android";
	        info.browser	= "chrome";
	    }
	    else if (browser_info.indexOf("edge") >= 0) {
	     	info.browser 	= "edge";
	     	try {
	        	info.version = browser_info.split(" edge/")[1].split(" ")[0].split(".")[0]
	        } catch(e) {}
	    }
	    else if (browser_info.indexOf("chrome") >= 0) {
	        info.browser 	= "chrome";
	        try {
	        	info.version = browser_info.split(" chrome/")[1].split(" ")[0].split(".")[0]
	        } catch(e) {}
	      }  
	    else if (browser_info.indexOf("safari") >= 0)
	        info.browser 	= "safari";
	    else if (browser_info.indexOf("firefox") >= 0)
	        info.browser 	= "firefox";
	 }
    return info;
}

function i_browser_ie_check() {
  // Internet Explorer Browser detector v0.5.1
  // By Eric Gerds   http://www.pinlady.net/PluginDetect/

  // Detect Internet Explorer
  // To detect IE, while being independent of the navigator.userAgent,
  // we use a combination of 2 methods:
  //
  //   a) Look at the document.documentMode. If this property is READ ONLY
  //    and is a number >=0, then we have IE 8+.
  //    According to Microsoft:
  //       When the current document has not yet been determined, documentMode returns a value of
  //       zero (0). This usually happens when a document is loading.
  //       When a return value of zero is received, try to determine the document
  //       compatibility mode at a later time.
  //
  //   b) See if the browser supports Conditional Compilation.
  //    If so, then we have IE < 11.
  //
  // AMS: 2/2/2016 Removed comments for tighter code
 
 var browser = 
 	{    
		verIE:null,
		docModeIE:null,
		verIEtrue:null,
		verIE_ua:null
	} 
  var tmp = document.documentMode;
  try {document.documentMode = "";} catch(e){};

  browser.isIE = typeof document.documentMode == "number" || eval("/*@cc_on!@*/!1");
  try {document.documentMode = tmp;} catch(e){};

  if (browser.isIE)  {
    browser.verIE_ua = 
           (/^(?:.*?[^a-zA-Z])??(?:MSIE|rv\s*\:)\s*(\d+\.?\d*)/i).test(navigator.userAgent || "") ?
           parseFloat(RegExp.$1, 10) : null;

    var e, verTrueFloat, x,
      obj = document.createElement("div"),
      
      CLASSID = [
         "{45EA75A0-A269-11D1-B5BF-0000F8051515}", // Internet Explorer Help
         "{3AF36230-A269-11D1-B5BF-0000F8051515}", // Offline Browsing Pack
         "{89820200-ECBD-11CF-8B85-00AA005B4383}"
      ];
    try {obj.style.behavior = "url(#default#clientcaps)"} catch(e){};
    for (x=0;x<CLASSID.length;x++) {
       try {
         browser.verIEtrue = obj.getComponentVersion(CLASSID[x],"componentid").replace(/,/g,".");
       } catch(e){};
       if (browser.verIEtrue) break;
    };
    verTrueFloat = parseFloat(browser.verIEtrue||"0", 10);
    browser.docModeIE = document.documentMode ||
       ((/back/i).test(document.compatMode || "") ? 5 : verTrueFloat) ||
       browser.verIE_ua;
    browser.verIE = verTrueFloat || browser.docModeIE;
  }
  return browser;
}
