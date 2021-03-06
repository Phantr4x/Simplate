(function () {
  "use strict";

  var simplate = {};

  simplate.cache = {};
  simplate.insertHTML = '';

  simplate.TAGS = {
    evaluate: /\{\{([\s\S]+?(\}?)+)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    nonescape: /\{\{!([\s\S]+?)\}\}/g,
    comment: /\{\{#([\s\S]+?)\}\}/g,
  };

  simplate.SETTINGS = {
    cache: true,
    escape: true,
    debug: true,
  };

  simplate.utils = {
    $copy: function (obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    $isArray: Array.isArray() || function (obj) {
      return ({}).toString().call(obj);
    },
    $escapeHTML: function (str) {
      return str.replace(/[&<>"'`=\/]/g, function (s) {
        return simplate.escapeMap[s];
      });
    }
      //...
  };

  simplate.config = function (option, value) {
    var self = this;
    if (value && typeof option === 'string') {
      self.SETTINGS[option] = value;
      // console.log(simplate.SETTINGS);
    } else if (!value && typeof option === 'object') {
      for (var item in option) {
        if (option.hasOwnProperty(item)) {
          self.SETTINGS[item] = option[item];
        }
      }
      // console.log(simplate.SETTINGS);
    } else {
      console.log('Error: Type error!');
    }
  };

  simplate.escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  simplate.skip = /$^/;

  simplate.template = function (tpl, data, options) {
    var self = this;
    options = options || {};
    for (var item in self.SETTINGS) {
      if (options[item] === 'undefined') {
        options[item] = self.SETTINGS[item];
      }
    }

    function unescape(code) {
      return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
    }

    tpl = ("var $out = '" + tpl
        .replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ")
        .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "")
        .replace(/'|\\/g, "\\$&")
        // 匹配注释代码
        .replace(self.TAGS.comment || self.skip, function (match, code) {
          // console.log(code);
          return "' /* " + unescape(code) + " */ + '";
        })
        // 匹配插值代码
        .replace(self.TAGS.interpolate || self.skip, function (match, code) {
          // console.log(code);
          return "' + (" + unescape(code) + ") + '";
        })
        // 匹配非编码代码
        .replace(self.TAGS.nonescape || self.skip, function (match, code) {
          return "' + simplate.utils.$escapeHTML(" + unescape(code) + ") + '";
        })
        // 匹配边界符代码
        .replace(self.TAGS.evaluate || self.skip, function (match, code) {
          // console.log(code);
          return "';" + unescape(code) + "$out += '"
        }) +
        "';return $out;")
      .replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
      .replace(/(\s|;|\}|^|\{)\$out\+='';/g, '$1').replace(/\+''/g, "");
    // console.log(tpl);

    try {
      return new Function('data', tpl);
    } catch (e) {
      if (typeof console !== 'undefined') {
        console.error('Cannot create a template function: \n' + tpl);
      }
      throw e;
    }
  };

  simplate.VERSION = '0.1.0';

  if (typeof (document) !== 'undefined' && document.body) {
    simplate.insertHTML = document.body.innerHTML;
  }

  var _globals = (function () {
    return this || (0, eval)("this");
  })();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = simplate;
  } else if (typeof define === "function" && define.amd) {
    define(function () {
      return simplate;
    });
  } else {
    _globals.simplate = simplate;
  }

})();
