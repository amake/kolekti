﻿var PlsqlParser=Editor.Parser=(function(){function b(k){return new RegExp('^(?:'+k.join('|')+')$','i');};var c=b(['abs','acos','add_months','ascii','asin','atan','atan2','average','bfilename','ceil','chartorowid','chr','concat','convert','cos','cosh','count','decode','deref','dual','dump','dup_val_on_index','empty','error','exp','false','floor','found','glb','greatest','hextoraw','initcap','instr','instrb','isopen','last_day','least','lenght','lenghtb','ln','lower','lpad','ltrim','lub','make_ref','max','min','mod','months_between','new_time','next_day','nextval','nls_charset_decl_len','nls_charset_id','nls_charset_name','nls_initcap','nls_lower','nls_sort','nls_upper','nlssort','no_data_found','notfound','null','nvl','others','power','rawtohex','reftohex','round','rowcount','rowidtochar','rpad','rtrim','sign','sin','sinh','soundex','sqlcode','sqlerrm','sqrt','stddev','substr','substrb','sum','sysdate','tan','tanh','to_char','to_date','to_label','to_multi_byte','to_number','to_single_byte','translate','true','trunc','uid','upper','user','userenv','variance','vsize']),d=b(['abort','accept','access','add','all','alter','and','any','array','arraylen','as','asc','assert','assign','at','attributes','audit','authorization','avg','base_table','begin','between','binary_integer','body','boolean','by','case','cast','char','char_base','check','close','cluster','clusters','colauth','column','comment','commit','compress','connect','connected','constant','constraint','crash','create','current','currval','cursor','data_base','database','date','dba','deallocate','debugoff','debugon','decimal','declare','default','definition','delay','delete','desc','digits','dispose','distinct','do','drop','else','elsif','enable','end','entry','escape','exception','exception_init','exchange','exclusive','exists','exit','external','fast','fetch','file','for','force','form','from','function','generic','goto','grant','group','having','identified','if','immediate','in','increment','index','indexes','indicator','initial','initrans','insert','interface','intersect','into','is','key','level','library','like','limited','local','lock','log','logging','long','loop','master','maxextents','maxtrans','member','minextents','minus','mislabel','mode','modify','multiset','new','next','no','noaudit','nocompress','nologging','noparallel','not','nowait','number_base','object','of','off','offline','on','online','only','open','option','or','order','out','package','parallel','partition','pctfree','pctincrease','pctused','pls_integer','positive','positiven','pragma','primary','prior','private','privileges','procedure','public','raise','range','raw','read','rebuild','record','ref','references','refresh','release','rename','replace','resource','restrict','return','returning','reverse','revoke','rollback','row','rowid','rowlabel','rownum','rows','run','savepoint','schema','segment','select','separate','session','set','share','snapshot','some','space','split','sql','start','statement','storage','subtype','successful','synonym','tabauth','table','tables','tablespace','task','terminate','then','to','trigger','truncate','type','union','unique','unlimited','unrecoverable','unusable','update','use','using','validate','value','values','variable','view','views','when','whenever','where','while','with','work']),e=b(['bfile','blob','character','clob','dec','float','int','integer','mlslabel','natural','naturaln','nchar','nclob','number','numeric','nvarchar2','real','rowtype','signtype','smallint','string','varchar','varchar2']),f=b([':=','<','<=','==','!=','<>','>','>=','like','rlike','in','xor','between']),g=/[*+\-<>=&|:\/]/,h=(function(){function k(m,n){var o=m.next();
if(o=='@'||o=='$'){m.nextWhileMatches(/[\w\d]/);return 'plsql-var';}else if(o=='"'||o=="'"||o=='`'){n(l(o));return null;}else if(o==','||o==';')return 'plsql-separator';else if(o=='-'){if(m.peek()=='-'){while(!m.endOfLine())m.next();return 'plsql-comment';}else if(/\d/.test(m.peek())){m.nextWhileMatches(/\d/);if(m.peek()=='.'){m.next();m.nextWhileMatches(/\d/);}return 'plsql-number';}else return 'plsql-operator';}else if(g.test(o)){m.nextWhileMatches(g);return 'plsql-operator';}else if(/\d/.test(o)){m.nextWhileMatches(/\d/);if(m.peek()=='.'){m.next();m.nextWhileMatches(/\d/);}return 'plsql-number';}else if(/[()]/.test(o))return 'plsql-punctuation';else{m.nextWhileMatches(/[_\w\d]/);var p=m.get(),q;if(f.test(p))q='plsql-operator';else if(d.test(p))q='plsql-keyword';else if(c.test(p))q='plsql-function';else if(e.test(p))q='plsql-type';else q='plsql-word';return{style:q,content:p};}};function l(m){return function(n,o){var p=false;while(!n.endOfLine()){var q=n.next();if(q==m&&!p){o(k);break;}p=!p&&q=='\\';}return m=='`'?'plsql-word':'plsql-literal';};};return function(m,n){return tokenizer(m,n||k);};})();function i(k){return function(l){var m=l&&l.charAt(0),n=k&&m==k.type;if(!k)return 0;else if(k.align)return k.col-(n?k.width:0);else return k.indent+(n?0:indentUnit);};};function j(k){var l=h(k),m=null,n=0,o=0;function p(s,t,u){m={prev:m,indent:n,col:o,type:s,width:t,align:u};};function q(){m=m.prev;};var r={next:function(){var s=l.next(),t=s.style,u=s.content,v=s.value.length;if(u=='\n'){s.indentation=i(m);n=o=0;if(m&&m.align==null)m.align=false;}else if(t=='whitespace'&&o==0)n=v;else if(!m&&t!='plsql-comment')p(';',0,false);if(u!='\n')o+=v;if(t=='plsql-punctuation'){if(u=='(')p(')',v);else if(u==')')q();}else if(t=='plsql-separator'&&u==';'&&m&&!m.prev)q();return s;},copy:function(){var s=m,t=n,u=o,v=l.state;return function(w){l=h(w,v);m=s;n=t;o=u;return r;};}};return r;};return{make:j,electricChars:')'};})();