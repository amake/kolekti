﻿var tokenizeXquery=(function(){function b(r,s){var t=false;while(!r.endOfLine()){var u=r.next();if(u==s&&!t)return false;t=!t&&u=='\\';}return t;};var c=(function(){function r(x,y){return{type:x,style:y};};var s={},t={},u=['after','ancestor','ancestor-or-self','and','as','ascending','assert','attribute','before','by','case','cast','child','comment','comment','declare','default','define','descendant','descendant-or-self','descending','document-node','element','element','else','eq','every','except','external','following','following-sibling','follows','for','function','if','import','in','instance','intersect','item','let','module','namespace','node','node','of','only','or','order','parent','precedes','preceding','preceding-sibling','processing-instruction','ref','return','returns','satisfies','schema','schema-element','self','some','sortby','stable','text','then','to','treat','typeswitch','union','variable','version','where','xquery'];for(var v in u)s[u[v]]=r('keyword','xqueryKeyword');t.xqueryKeywordA=['if','switch','while','for'];t.xqueryKeywordB=['else','then','try','finally'];t.xqueryKeywordC=['element','attribute','let','implements','import','module','namespace','return','super','this','throws','where'];t.xqueryOperator=['eq','ne','lt','le','gt','ge'];for(var w in t){for(var v=0;v<t[w].length;v++)s[t[w][v]]=r(w,'xqueryKeyword');}t={};t.xqueryAtom=['null','fn:false()','fn:true()'];for(var w in t){for(var v=0;v<t[w].length;v++)s[t[w][v]]=r(w,w);}t={};t.xqueryModifier=['xquery','ascending','descending'];t.xqueryType=['xs:string','xs:float','xs:decimal','xs:double','xs:integer','xs:boolean','xs:date','xs:dateTime','xs:time','xs:duration','xs:dayTimeDuration','xs:time','xs:yearMonthDuration','numeric','xs:hexBinary','xs:base64Binary','xs:anyURI','xs:QName','xs:byte','xs:boolean','xs:anyURI','xf:yearMonthDuration'];for(var w in t){for(var v=0;v<t[w].length;v++)s[t[w][v]]=r('function',w);}s=q(s,{'catch':r('catch','xqueryKeyword'),'for':r('for','xqueryKeyword'),'case':r('case','xqueryKeyword'),'default':r('default','xqueryKeyword'),'instanceof':r('operator','xqueryKeyword')});var t={};t.xqueryKeywordC=['assert','property'];for(var v=0;v<t.xqueryKeywordC.length;v++)s[t.xqueryKeywordC[v]]=r('xqueryKeywordC','xqueryKeyword');s=q(s,{as:r('operator','xqueryKeyword'),'in':r('operator','xqueryKeyword'),at:r('operator','xqueryKeyword'),declare:r('function','xqueryKeyword'),'function':r('function','xqueryKeyword')});return s;})();function d(r,s){if(s in {'fn:true':'','fn:false':''}&&r.lookAhead('()',false)){r.next();
r.next();r.get();return{type:'function',style:'xqueryAtom',content:s+'()'};}else if(s in {node:'',item:'',text:''}&&r.lookAhead('()',false)){r.next();r.next();r.get();return{type:'function',style:'xqueryType',content:s+'()'};}else if(r.lookAhead('('))return{type:'function',style:'xqueryFunction',content:s};else return null;};var e=/[=+\-*&%!?@\/]/,f=/[0-9]/,g=/^[0-9A-Fa-f]$/,h=/[\w\:\-\$_]/,i=/[\w\$_-]/,j=/[\w\.()\[\]{}]/,k=/[\[\]{}\(\),;\.]/,l=/^[\/'"]$/,m=/^[\/'$]/,n=/[<\w\:\-\/_]/;function o(r,s){return function(t,u){var v=r,w=p(r,s,t,function(y){v=y;}),x=w.type=='operator'||w.type=='xqueryKeywordC'||w.type=='xqueryKeywordC'||w.type.match(/^[\[{}\(,;:]$/);if(x!=s||v!=r)u(o(v,x));return w;};};function p(r,s,t,u){function v(){u(null);t.next();t.nextWhileMatches(g);return{type:'number',style:'xqueryNumber'};};function w(){u(null);t.nextWhileMatches(f);if(t.equals('.')){t.next();if(t.equals('.'))t.next();t.nextWhileMatches(f);}if(t.equals('e')||t.equals('E')){t.next();if(t.equals('-'))t.next();t.nextWhileMatches(f);}return{type:'number',style:'xqueryNumber'};};function x(){t.nextWhileMatches(h);var G=t.get(),H=d(t,G);if(H)return H;var I=c.hasOwnProperty(G)&&c.propertyIsEnumerable(G)&&c[G];if(I)return{type:I.type,style:I.style,content:G};return{type:'word',style:'word',content:G};};function y(){b(t,'/');return{type:'regexp',style:'xqueryRegexp'};};function z(G){var H='(:',I=G==':';for(;;){if(t.endOfLine())break;var J=t.next();if(J==')'&&I){H=null;break;}I=J==':';}u(H);return{type:'comment',style:'xqueryComment'};};function A(){if(F=='=')u('=');else if(F=='~')u('~');else if(F==':'&&t.equals('=')){u(null);t.nextWhileMatches(/[:=]/);var G=t.get();return{type:'operator',style:'xqueryOperator',content:G};}else u(null);return{type:'operator',style:'xqueryOperator'};};function B(G){var H=G,I='';for(;;){if(t.endOfLine())break;if(t.lookAhead('{',false)){H=G+'{';break;}var J=t.next();if(J==G&&I!='\\'){H=null;break;}I=J;}u(H);return{type:'string',style:'xqueryString'};};function C(G){var H=G.substr(0,1);u(H);return{type:F,style:'xqueryPunctuation'};};function D(){t.nextWhileMatches(i);var G=t.get();return{type:'variable',style:'xqueryVariable',content:G};};function E(G){var H=t.lookAhead('/',false)?'xml-tag-close':'xml-tag-open';t.nextWhileMatches(n);var I=t.get();if(t.lookAhead('>',false))t.next();return{type:H,style:'xml-tagname',content:I};};if(r=='"'||r=="'")return B(r);var F=t.next();if(r&&r.indexOf('{')==1&&F=='}')return C(r);if(r=='(:')return z(F);else if(F=='"'||F=="'")return B(F);
else if(F=='.'&&t.equals('.')){t.next();return{type:'..',style:'xqueryOperator'};}else if(F=='('&&t.equals(':')){t.next();return z(F);}else if(F=='$')return D();else if(F==':'&&t.equals('='))return A();else if(k.test(F))return{type:F,style:'xqueryPunctuation'};else if(F=='0'&&(t.equals('x')||t.equals('X')))return v();else if(f.test(F))return w();else if(F=='~'){u('~');return A(F);}else if(e.test(F))return A(F);else if(F=='<')return E(F);else if(F=='>')return{type:'xml-tag',style:'xml-tagname'};else return x();};function q(r,s){for(var t in s){if(!s.hasOwnProperty(t))continue;if(r.hasOwnProperty(t))continue;r[t]=s[t];}return r;};return function(r,s){return tokenizer(r,s||o(false,true));};})();