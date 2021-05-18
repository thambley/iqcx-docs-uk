/* http://www.menucool.com/tabbed-content Free to use. v2013.7.6 */
(function () {
  var preventDefault = function (evt) {
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
    }
    if (evt && evt.preventDefault) {
      evt.preventDefault();
    }
  },
    addEvent = function (elem, eventName, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(eventName, fn, false);
      } else {
        elem.attachEvent("on" + eventName, function () {
          // set the this pointer same as addEventListener when fn is called
          return (fn.call(elem, window.event));
        });
      }
    },
    hasClass = function (elem, className) {
      var classPattern = new RegExp("(^| )" + className + "( |$)");
      return classPattern.test(elem.className) ? true : false;
    },
    addClass = function (elem, className, first) {
      if (!hasClass(elem, className)) {
        if (elem.className == "") {
          elem.className = className;
        } else if (first) {
          elem.className = className + " " + elem.className;
        } else {
          elem.className += " " + className;
        }
      }
    },
    removeClass = function (elem, className) {
      var classPattern = new RegExp("(^| )" + className + "( |$)");
      elem.className = elem.className.replace(classPattern, "$1");
      elem.className = elem.className.replace(/ $/, "")
    },
    pageName = function () {
      var path = window.location.pathname;
      var lastPart = '';
      if (path.indexOf("/") != -1) {
        pathParts = path.split("/").filter(part => part.length > 0);
        lastPart = pathParts[pathParts.length - 1] || "root";
      } else {
        lastPart = path || "root";
      }
      if (lastPart.indexOf(".") != -1) {
        lastPart = lastPart.substring(0, lastPart.indexOf("."));
      }
      if (lastPart.length > 20) {
        lastPart = lastPart.substring(lastPart.length - 19);
      }
      return lastPart;
    },
    cookieName = "mi" + pageName(),
    TabGroup = function (elem, index) {
      this.init(elem, index)
    };
  TabGroup.prototype = {
    loadSelectedTab: function () {
      var cookiePattern = new RegExp(cookieName + this.index + "=(\\d+)"),
        cookieMatch = document.cookie.match(cookiePattern);
      return cookieMatch ? cookieMatch[1] : this.getSelectedIndex()
    },
    getSelectedIndex: function () {
      var c = this.tabs.length;
      for (var b = 0; b < c; b++) {
        if (hasClass(this.tabs[b].parentNode, "selected")) {
          return b;
        }
      }
      return 0;
    },
    selectTab: function (tabLink, updateCookie) {
      var target = document.getElementById(tabLink.targetId);
      if (!target) return;
      this.showTab(target);
      for (var a = 0; a < this.tabs.length; a++)
        if (this.tabs[a] == tabLink) {
          addClass(tabLink.parentNode, "selected");
          if (updateCookie && this.dataPersist) {
            this.storeSelectedTab(this.index, a);
          }
        } else {
          removeClass(this.tabs[a].parentNode, "selected");
        }
    },
    storeSelectedTab: function (tabGroupIndex, tabIndex) {
      document.cookie = cookieName + tabGroupIndex + "=" + tabIndex + "; path=/"
    },
    showTab: function (target) {
      for (var a = 0; a < this.targets.length; a++) {
        this.targets[a].style.display = this.targets[a].id == target.id ? "block" : "none";
      }
    },
    initTabs: function () {
      this.targets = [];
      var tabGroup = this;
      for (var a = 0; a < this.tabs.length; a++) {
        var target = document.getElementById(this.tabs[a].targetId);
        if (target) {
          this.targets.push(target);
          addEvent(this.tabs[a], "click", function (evt) {
            var tabLink = this;
            if (tabLink === window) {
              tabLink = window.event.srcElement;
            }
            tabGroup.selectTab(tabLink, 1);
            preventDefault(evt);
            return false;
          })
        }
      }
    },
    init: function (elem, index) {
      this.index = index;
      this.tabs = [];
      var links = elem.getElementsByTagName("a"),
        anchorPattern = /#([^?]+)/;
      for (c = 0; c < links.length; c++) {
        var tabLink = links[c];
        var href = tabLink.getAttribute("href");
        if (href.indexOf("#") == -1) {
          continue;
        } else {
          var anchorMatch = href.match(anchorPattern);
          if (anchorMatch) {
            href = anchorMatch[1];
            tabLink.targetId = href;
            this.tabs.push(tabLink);
          } else {
            continue;
          }
        }
      }
      var dataPersist = elem.getAttribute("data-persist") || "";
      this.dataPersist = dataPersist.toLowerCase() == "true" ? 1 : 0;
      this.initTabs();
      this.initSelectedTab()
    },
    initSelectedTab: function () {
      var selectedTabIndex = this.dataPersist ? parseInt(this.loadSelectedTab()) : this.getSelectedIndex();
      if (selectedTabIndex >= this.tabs.length) {
        selectedTabIndex = 0;
      }
      this.selectTab(this.tabs[selectedTabIndex], 0);
    }
  };
  var tabGroups = [],
    documentReady = function (func) {
      var starting = false;

      function startFunc() {
        if (starting) return;
        starting = true;
        setTimeout(func, 4)
      }
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", startFunc, false);
      } else if (document.attachEvent) {
        try {
          var toplevel = window.frameElement == null;
        } catch (e) { }
        if (document.documentElement.doScroll && toplevel) {
          function doScrollCheck() {
            if (starting) return;
            try {
              document.documentElement.doScroll("left");
              startFunc()
            } catch (e) {
              setTimeout(doScrollCheck, 10)
            }
          }
          doScrollCheck()
        }
        document.attachEvent("onreadystatechange", function () {
          document.readyState === "complete" && startFunc()
        })
      }
      addEvent(window, "load", startFunc)
    },
    initTabGroups = function () {
      var possibleTabGroups = document.getElementsByTagName("ul"),
        e = possibleTabGroups.length;
      for (c = 0; c < e; c++) {
        if (hasClass(possibleTabGroups[c], "tabs")) {
          tabGroups.push(new TabGroup(possibleTabGroups[c], c));
        }
      }
    };
  documentReady(initTabGroups);
  return {}
})()
