﻿var HTMLMixedParser=Editor.Parser=(function(){var b={script:'JSParser',style:'CSSParser'};function c(){var e=['XMLParser'];for(var f in b)e.push(b[f]);for(var g in e){if(!window[e[g]])throw new Error(e[g]+' parser must be loaded for HTML mixed mode to work.');}XMLParser.configure({useHTMLKludges:true});};function d(e){c();var f=XMLParser.make(e),g=null,h=false,i={next:j,copy:l};function j(){var m=f.next();if(m.content=='<')h=true;else if(m.style=='xml-tagname'&&h===true)h=m.content.toLowerCase();else if(m.content=='>'){if(b[h]){var n=window[b[h]];i.next=k(n,'</'+h);}h=false;}return m;};function k(m,n){var o=f.indentation();g=m.make(e,o+indentUnit);return function(){if(e.lookAhead(n,false,false,true)){g=null;i.next=j;return j();}var p=g.next(),q=p.value.lastIndexOf('<'),r=Math.min(p.value.length-q,n.length);if(q!=-1&&p.value.slice(q,q+r).toLowerCase()==n.slice(0,r)&&e.lookAhead(n.slice(r),false,false,true)){e.push(p.value.slice(q));p.value=p.value.slice(0,q);}if(p.indentation){var s=p.indentation;p.indentation=function(t){if(t=='</')return o;else return s(t);};}return p;};};function l(){var m=f.copy(),n=g&&g.copy(),o=i.next,p=h;return function(q){e=q;f=m(q);g=n&&n(q);i.next=o;h=p;return i;};};return i;};return{make:d,electricChars:'{}/:',configure:function(e){if(e.triggers)b=e.triggers;}};})();