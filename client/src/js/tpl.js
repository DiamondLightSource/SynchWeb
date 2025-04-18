/**
 * @license RequireJS text 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/* eslint no-useless-escape: "off"*/

(function () {
  var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
    xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
    bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
    hasLocation = typeof location !== 'undefined' && location.href,
    defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
    defaultHostName = hasLocation && location.hostname,
    defaultPort = hasLocation && (location.port || undefined),
    buildMap = [];

  var templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  function template(text, data, settings) {
    settings = templateSettings;

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+_.escape(" + unescape(code) + ")+'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+(" + unescape(code) + ")+'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';" + unescape(code) + ";__p+='";
      }) + "';";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){' + source + '}';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};" +
      source + "return __p;";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){' +
      source + '}';

    return template;
  }


  define(function () {
    var text, get, fs;

    if (typeof window !== "undefined" && window.navigator && window.document) {
      get = function (url, callback) {
        var xhr = text.createXhr();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function (evt) {
          //Do not explicitly handle errors, those should be
          //visible via console output in the browser.
          if (xhr.readyState === 4) {
            callback(xhr.responseText);
          }
        };
        xhr.send(null);
      };
    } else if (typeof process !== "undefined" &&
      process.versions &&
      !!process.versions.node) {
      //Using special require.nodeRequire, something added by r.js.
      fs = require.nodeRequire('fs');

      get = function (url, callback) {
        callback(fs.readFileSync(url, 'utf8'));
      };
    } else if (typeof Packages !== 'undefined') {
      //Why Java, why is this so awkward?
      get = function (url, callback) {
        var encoding = "utf-8",
          file = new java.io.File(url),
          lineSeparator = java.lang.System.getProperty("line.separator"),
          input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
          stringBuffer, line,
          content = '';
        try {
          stringBuffer = new java.lang.StringBuffer();
          line = input.readLine();

          // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
          // http://www.unicode.org/faq/utf_bom.html

          // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
          // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
          if (line && line.length() && line.charAt(0) === 0xfeff) {
            // Eat the BOM, since we've already found the encoding on this file,
            // and we plan to concatenating this buffer with others; the BOM should
            // only appear at the top of a file.
            line = line.substring(1);
          }

          stringBuffer.append(line);

          while ((line = input.readLine()) !== null) {
            stringBuffer.append(lineSeparator);
            stringBuffer.append(line);
          }
          //Make sure we return a JavaScript string and not a Java string.
          content = String(stringBuffer.toString()); //String
        } finally {
          input.close();
        }
        callback(content);
      };
    }

    text = {
      version: '1.0.0',

      strip: function (content) {
        //Strips <?xml ...?> declarations so that external SVG and XML
        //documents can be added to a document without worry. Also, if the string
        //is an HTML document, only the part inside the body tag is returned.
        if (content) {
          content = content.replace(xmlRegExp, "");
          var matches = content.match(bodyRegExp);
          if (matches) {
            content = matches[1];
          }
        } else {
          content = "";
        }
        return content;
      },

      jsEscape: function (content) {
        return content.replace(/(['\\])/g, '\\$1')
          .replace(/[\f]/g, "\\f")
          .replace(/[\b]/g, "\\b")
          .replace(/[\n]/g, "\\n")
          .replace(/[\t]/g, "\\t")
          .replace(/[\r]/g, "\\r");
      },

      createXhr: function () {
        //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
        var xhr, i, progId;
        if (typeof XMLHttpRequest !== "undefined") {
          return new XMLHttpRequest();
        } else {
          for (i = 0; i < 3; i++) {
            progId = progIds[i];
            try {
              xhr = new ActiveXObject(progId);
            } catch (e) {
                console.error("Error with ActiveXObject: ", e);
            }

            if (xhr) {
              progIds = [progId];  // so faster next time
              break;
            }
          }
        }

        if (!xhr) {
          throw new Error("createXhr(): XMLHttpRequest not available");
        }

        return xhr;
      },

      get: get,

      /**
       * Parses a resource name into its component parts. Resource names
       * look like: module/name.ext!strip, where the !strip part is
       * optional.
       * @param {String} name the resource name
       * @returns {Object} with properties "moduleName", "ext" and "strip"
       * where strip is a boolean.
       */
      parseName: function (name) {
        var strip = false, index = name.indexOf("."),
          modName = name.substring(0, index),
          ext = name.substring(index + 1, name.length);

        index = ext.indexOf("!");
        if (index !== -1) {
          //Pull off the strip arg.
          strip = ext.substring(index + 1, ext.length);
          strip = strip === "strip";
          ext = ext.substring(0, index);
        }

        return {
          moduleName: modName,
          ext: ext,
          strip: strip
        };
      },

      xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

      /**
       * Is an URL on another domain. Only works for browser use, returns
       * false in non-browser environments. Only used to know if an
       * optimized .js version of a text resource should be loaded
       * instead.
       * @param {String} url
       * @returns Boolean
       */
      useXhr: function (url, protocol, hostname, port) {
        var match = text.xdRegExp.exec(url),
          uProtocol, uHostName, uPort;
        if (!match) {
          return true;
        }
        uProtocol = match[2];
        uHostName = match[3];

        uHostName = uHostName.split(':');
        uPort = uHostName[1];
        uHostName = uHostName[0];

        return (!uProtocol || uProtocol === protocol) &&
          (!uHostName || uHostName === hostname) &&
          ((!uPort && !uHostName) || uPort === port);
      },

      finishLoad: function (name, strip, content, onLoad, config) {
        content = strip ? text.strip(content) : content;
        var tpl = template(content);
        var tplString = tpl.source;
        if (config.isBuild && config.inlineText) {
          buildMap[name] = tplString;
        }
        onLoad(tpl);
      },

      load: function (name, req, onLoad, config) {
        //Name has format: some.module.filext!strip
        //The strip part is optional.
        //if strip is present, then that means only get the string contents
        //inside a body tag in an HTML string. For XML/SVG content it means
        //removing the <?xml ...?> declarations so the content can be inserted
        //into the current doc without problems.

        var parsed = text.parseName(name),
          nonStripName = parsed.moduleName + '.' + parsed.ext,
          url = req.toUrl(nonStripName),
          useXhr = (config && config.text && config.text.useXhr) ||
            text.useXhr;

        //Load the text. Use XHR if possible and in a browser.
        if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
          text.get(url, function (content) {
            text.finishLoad(name, parsed.strip, content, onLoad, config);
          });
        } else {
          //Need to fetch the resource across domains. Assume
          //the resource has been optimized into a JS module. Fetch
          //by the module name + extension, but do not include the
          //!strip part to avoid file system issues.
          req([nonStripName], function (content) {
            text.finishLoad(parsed.moduleName + '.' + parsed.ext,
              parsed.strip, content, onLoad, config);
          });
        }
      },

      write: function (pluginName, moduleName, write, config) {
        if (moduleName in buildMap) {
          var content = buildMap[moduleName];
          write('define("'+ pluginName +'!'+ moduleName +'", function() { return ' + content + '; });\n');
        }
      },

      writeFile: function (pluginName, moduleName, req, write, config) {
        var parsed = text.parseName(moduleName),
          nonStripName = parsed.moduleName + '.' + parsed.ext,
        //Use a '.js' file name so that it indicates it is a
        //script that can be loaded across domains.
          fileName = req.toUrl(parsed.moduleName + '.' +
            parsed.ext) + '.js';

        //Leverage own load() method to load plugin value, but only
        //write out values that do not have the strip argument,
        //to avoid any potential issues with ! in file names.
        text.load(nonStripName, req, function (value) {
          //Use own write() method to construct full module value.
          //But need to create shell that translates writeFile's
          //write() to the right interface.
          var textWrite = function (contents) {
            return write(fileName, contents);
          };
          textWrite.asModule = function (moduleName, contents) {
            return write.asModule(moduleName, fileName, contents);
          };

          text.write(pluginName, nonStripName, textWrite, config);
        }, config);
      }
    };

    return text;
  });
}());
