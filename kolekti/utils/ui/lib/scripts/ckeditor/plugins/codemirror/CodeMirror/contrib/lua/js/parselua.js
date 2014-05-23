﻿function findFirstRegexp(l){return new RegExp('^(?:'+l.join('|')+')','i');};function matchRegexp(l){return new RegExp('^(?:'+l.join('|')+')$','i');};var luaCustomFunctions=matchRegexp([]);function configureLUA(l){if(l)luaCustomFunctions=matchRegexp(l);};var luaStdFunctions=matchRegexp(['_G','_VERSION','assert','collectgarbage','dofile','error','getfenv','getmetatable','ipairs','load','loadfile','loadstring','module','next','pairs','pcall','print','rawequal','rawget','rawset','require','select','setfenv','setmetatable','tonumber','tostring','type','unpack','xpcall','coroutine.create','coroutine.resume','coroutine.running','coroutine.status','coroutine.wrap','coroutine.yield','debug.debug','debug.getfenv','debug.gethook','debug.getinfo','debug.getlocal','debug.getmetatable','debug.getregistry','debug.getupvalue','debug.setfenv','debug.sethook','debug.setlocal','debug.setmetatable','debug.setupvalue','debug.traceback','close','flush','lines','read','seek','setvbuf','write','io.close','io.flush','io.input','io.lines','io.open','io.output','io.popen','io.read','io.stderr','io.stdin','io.stdout','io.tmpfile','io.type','io.write','math.abs','math.acos','math.asin','math.atan','math.atan2','math.ceil','math.cos','math.cosh','math.deg','math.exp','math.floor','math.fmod','math.frexp','math.huge','math.ldexp','math.log','math.log10','math.max','math.min','math.modf','math.pi','math.pow','math.rad','math.random','math.randomseed','math.sin','math.sinh','math.sqrt','math.tan','math.tanh','os.clock','os.date','os.difftime','os.execute','os.exit','os.getenv','os.remove','os.rename','os.setlocale','os.time','os.tmpname','package.cpath','package.loaded','package.loaders','package.loadlib','package.path','package.preload','package.seeall','string.byte','string.char','string.dump','string.find','string.format','string.gmatch','string.gsub','string.len','string.lower','string.match','string.rep','string.reverse','string.sub','string.upper','table.concat','table.insert','table.maxn','table.remove','table.sort']),luaKeywords=matchRegexp(['and','break','elseif','false','nil','not','or','return','true','function','end','if','then','else','do','while','repeat','until','for','in','local']),luaIndentKeys=matchRegexp(['function','if','repeat','for','while','[(]','{']),luaUnindentKeys=matchRegexp(['end','until','[)]','}']),luaUnindentKeys2=findFirstRegexp(['end','until','[)]','}']),luaMiddleKeys=findFirstRegexp(['else','elseif']),LUAParser=Editor.Parser=(function(){var l=(function(){function o(s,t){var u=s.next();
if(u=='-'&&s.equals('-')){s.next();t(p);return null;}else if(u=='"'||u=="'"){t(r(u));return null;}if(u=='['&&(s.equals('[')||s.equals('='))){var v=0;while(s.equals('=')){v++;s.next();}if(!s.equals('['))return 'lua-error';t(q(v,'lua-string'));return null;}else if(u=='='){if(s.equals('='))s.next();return 'lua-token';}else if(u=='.'){if(s.equals('.'))s.next();if(s.equals('.'))s.next();return 'lua-token';}else if(u=='+'||u=='-'||u=='*'||u=='/'||u=='%'||u=='^'||u=='#')return 'lua-token';else if(u=='>'||u=='<'||u=='('||u==')'||u=='{'||u=='}'||u=='[')return 'lua-token';else if(u==']'||u==';'||u==':'||u==',')return 'lua-token';else if(s.equals('=')&&(u=='~'||u=='<'||u=='>')){s.next();return 'lua-token';}else if(/\d/.test(u)){s.nextWhileMatches(/[\w.%]/);return 'lua-number';}else{s.nextWhileMatches(/[\w\\\-_.]/);return 'lua-identifier';}};function p(s,t){var u=true,v=0;while(!s.endOfLine()){var w=s.next(),x=0;if(w=='['&&u){while(s.equals('=')){s.next();x++;}if(s.equals('[')){t(q(x,'lua-comment'));return null;}}u=false;}t(o);return 'lua-comment';};function q(s,t){return function(u,v){var w=0;while(!u.endOfLine()){var x=u.next();if(w==s+1&&x==']'){v(o);break;}if(w==0)w=x==']'?1:0;else w=x=='='?w+1:0;}return t;};};function r(s){return function(t,u){var v=false;while(!t.endOfLine()){var w=t.next();if(w==s&&!v)break;v=!v&&w=='\\';}if(!v)u(o);return 'lua-string';};};return function(s,t){return tokenizer(s,t||o);};})();function m(o,p){return function(q){var r=luaUnindentKeys2.test(q)||luaMiddleKeys.test(q);return p+indentUnit*(o-(r?1:0));};};function n(o,p){p=p||0;var q=l(o),r=0,s={next:function(){var t=q.next(),u=t.style,v=t.content;if(u=='lua-identifier'&&luaKeywords.test(v))t.style='lua-keyword';if(u=='lua-identifier'&&luaStdFunctions.test(v))t.style='lua-stdfunc';if(u=='lua-identifier'&&luaCustomFunctions.test(v))t.style='lua-customfunc';if(u!='lua-comment'&&u!='lua-string'){if(luaIndentKeys.test(v))r++;else if(luaUnindentKeys.test(v))r--;}if(v=='\n')t.indentation=m(r,p);return t;},copy:function(){var t=q.state,u=r;return function(v){q=l(v,t);r=u;return s;};}};return s;};return{make:n,configure:configureLUA,electricChars:'delf})'};})();