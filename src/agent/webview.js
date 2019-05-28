// Fallback to old WebView where SFSafariViewController is not supported
var openingUrl;

function WebView() {
  this.tab = null;
  this.handler = null;
  this.open = this.open.bind(this);
  this.handleFirstLoadEnd = this.handleFirstLoadEnd.bind(this);
  this.handleLoadError = this.handleLoadError.bind(this);
  this.handleExit = this.handleExit.bind(this);
  this.clearEvents = this.clearEvents.bind(this);
  this.close = this.close.bind(this);
  this.opened = false;
}


WebView.prototype.open = function (url, handler) {
  var browser = window.cordova.InAppBrowser;
  var tab = browser.open(url, '_blank', "location=no,toolbar=no,zoom=no,beforeload=yes");

  openingUrl = null;

  tab.addEventListener('loadstop', this.handleFirstLoadEnd);
  tab.addEventListener('loaderror', this.handleLoadError);
  tab.addEventListener('exit', this.handleExit);
  tab.addEventListener('loadstart', function(event){
    if(getUrlDomain(url) !== getUrlDomain(event.url)){
      openingUrl = event.url;
      tab.close();
    }
  });

  this.tab = tab;
  this.handler = handler;
};

function getUrlDomain(stringUrl) {
  var a = document.createElement('a');
  a.href = stringUrl;
  return a.hostname;
}

WebView.prototype.handleFirstLoadEnd = function () {
  this.handler(null, { event: 'loaded'});
};

WebView.prototype.handleLoadError = function (e) {
  this.clearEvents();
  this.handler(e, null);
};

WebView.prototype.handleExit = function (event) {
  this.clearEvents();
  this.handler(null, { event: 'closed', url: openingUrl  });
};

WebView.prototype.clearEvents = function () {
  if (this.tab.null) {
    return;
  }
  this.tab.removeEventListener('loaderror', this.handleLoadError);
  this.tab.removeEventListener('loadstop', this.handleFirstLoadEnd);
  this.tab.removeEventListener('exit', this.handleExit);
};

WebView.prototype.close = function () {
  if (this.tab != null) {
    this.tab.close();
  }
  this.clearEvents();
  this.tab = null;
  this.handler = null;
};


module.exports = WebView;
