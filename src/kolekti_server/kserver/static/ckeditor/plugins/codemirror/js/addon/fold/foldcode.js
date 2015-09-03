﻿(function(b){"object"==typeof exports&&"object"==typeof module?b(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],b):b(CodeMirror)})(function(b){function h(a,d,c,g){function f(c){var b=h(a,d);if(!b||b.to.line-b.from.line<j)return null;for(var f=a.findMarksAt(b.from),e=0;e<f.length;++e)if(f[e].__isFold&&"fold"!==g){if(!c)return null;b.cleared=!0;f[e].clear()}return b}if(c&&c.call)var h=c,c=null;else h=i(a,c,"rangeFinder");"number"==typeof d&&(d=
b.Pos(d,0));var j=i(a,c,"minFoldSize"),e=f(!0);if(i(a,c,"scanUp"))for(;!e&&d.line>a.firstLine();)d=b.Pos(d.line-1,0),e=f(!1);if(e&&!(e.cleared||"unfold"===g)){c=l(a,c);b.on(c,"mousedown",function(a){k.clear();b.e_preventDefault(a)});var k=a.markText(e.from,e.to,{replacedWith:c,clearOnEnter:!0,__isFold:!0});k.on("clear",function(c,d){b.signal(a,"unfold",a,c,d)});b.signal(a,"fold",a,e.from,e.to)}}function l(a,d){var c=i(a,d,"widget");if("string"==typeof c){var b=document.createTextNode(c),c=document.createElement("span");
c.appendChild(b);c.className="CodeMirror-foldmarker"}return c}function i(a,d,c){return d&&void 0!==d[c]?d[c]:(a=a.options.foldOptions)&&void 0!==a[c]?a[c]:j[c]}b.newFoldFunction=function(a,d){return function(c,b){h(c,b,{rangeFinder:a,widget:d})}};b.defineExtension("foldCode",function(a,d,c){h(this,a,d,c)});b.defineExtension("isFolded",function(a){for(var a=this.findMarksAt(a),d=0;d<a.length;++d)if(a[d].__isFold)return!0});b.commands.toggleFold=function(a){a.foldCode(a.getCursor())};b.commands.fold=
function(a){a.foldCode(a.getCursor(),null,"fold")};b.commands.unfold=function(a){a.foldCode(a.getCursor(),null,"unfold")};b.commands.foldAll=function(a){a.operation(function(){for(var d=a.firstLine(),c=a.lastLine();d<=c;d++)a.foldCode(b.Pos(d,0),null,"fold")})};b.commands.unfoldAll=function(a){a.operation(function(){for(var d=a.firstLine(),c=a.lastLine();d<=c;d++)a.foldCode(b.Pos(d,0),null,"unfold")})};b.registerHelper("fold","combine",function(){var a=Array.prototype.slice.call(arguments,0);return function(d,
c){for(var b=0;b<a.length;++b){var f=a[b](d,c);if(f)return f}}});b.registerHelper("fold","auto",function(a,b){for(var c=a.getHelpers(b,"fold"),g=0;g<c.length;g++){var f=c[g](a,b);if(f)return f}});var j={rangeFinder:b.fold.auto,widget:"↔",minFoldSize:0,scanUp:!1};b.defineOption("foldOptions",null);b.defineExtension("foldOption",function(a,b){return i(this,a,b)})});