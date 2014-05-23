﻿(function(){var a={ol:1,ul:1},b=/^[\n\r\t ]*$/,c=CKEDITOR.dom.walker.whitespaces(),d=CKEDITOR.dom.walker.bookmark(),e=function(u){return!(c(u)||d(u));};function f(u){var v,w,x;if(v=u.getDirection()){w=u.getParent();while(w&&!(x=w.getDirection()))w=w.getParent();if(v==x)u.removeAttribute('dir');}};CKEDITOR.plugins.list={listToArray:function(u,v,w,x,y){if(!a[u.getName()])return[];if(!x)x=0;if(!w)w=[];for(var z=0,A=u.getChildCount();z<A;z++){var B=u.getChild(z);if(B.type==CKEDITOR.NODE_ELEMENT&&B.getName() in CKEDITOR.dtd.$list)CKEDITOR.plugins.list.listToArray(B,v,w,x+1);if(B.$.nodeName.toLowerCase()!='li')continue;var C={parent:u,indent:x,element:B,contents:[]};if(!y){C.grandparent=u.getParent();if(C.grandparent&&C.grandparent.$.nodeName.toLowerCase()=='li')C.grandparent=C.grandparent.getParent();}else C.grandparent=y;if(v)CKEDITOR.dom.element.setMarker(v,B,'listarray_index',w.length);w.push(C);for(var D=0,E=B.getChildCount(),F;D<E;D++){F=B.getChild(D);if(F.type==CKEDITOR.NODE_ELEMENT&&a[F.getName()])CKEDITOR.plugins.list.listToArray(F,v,w,x+1,C.grandparent);else C.contents.push(F);}}return w;},arrayToList:function(u,v,w,x,y){if(!w)w=0;if(!u||u.length<w+1)return null;var z=u[w].parent.getDocument(),A=new CKEDITOR.dom.documentFragment(z),B=null,C=w,D=Math.max(u[w].indent,0),E=null,F,G=x==CKEDITOR.ENTER_P?'p':'div';while(1){var H=u[C];F=H.element.getDirection(1);if(H.indent==D){if(!B||u[C].parent.getName()!=B.getName()){B=u[C].parent.clone(false,1);y&&B.setAttribute('dir',y);A.append(B);}E=B.append(H.element.clone(0,1));if(F!=B.getDirection(1))E.setAttribute('dir',F);for(var I=0;I<H.contents.length;I++)E.append(H.contents[I].clone(1,1));C++;}else if(H.indent==Math.max(D,0)+1){var J=u[C-1].element.getDirection(1),K=CKEDITOR.plugins.list.arrayToList(u,null,C,x,J!=F?F:null);if(!E.getChildCount()&&CKEDITOR.env.ie&&!(z.$.documentMode>7))E.append(z.createText('\xa0'));E.append(K.listNode);C=K.nextIndex;}else if(H.indent==-1&&!w&&H.grandparent){if(a[H.grandparent.getName()])E=H.element.clone(false,true);else if(y||H.element.hasAttributes()||x!=CKEDITOR.ENTER_BR){E=z.createElement(G);H.element.copyAttributes(E,{type:1,value:1});if(!y&&x==CKEDITOR.ENTER_BR&&!E.hasAttributes())E=new CKEDITOR.dom.documentFragment(z);}else E=new CKEDITOR.dom.documentFragment(z);if(E.type==CKEDITOR.NODE_ELEMENT)if(H.grandparent.getDirection(1)!=F)E.setAttribute('dir',F);for(I=0;I<H.contents.length;I++)E.append(H.contents[I].clone(1,1));if(E.type==CKEDITOR.NODE_DOCUMENT_FRAGMENT&&C!=u.length-1){var L=E.getLast();
if(L&&L.type==CKEDITOR.NODE_ELEMENT&&L.getAttribute('type')=='_moz')L.remove();if(!(L=E.getLast(e)&&L.type==CKEDITOR.NODE_ELEMENT&&L.getName() in CKEDITOR.dtd.$block))E.append(z.createElement('br'));}if(E.type==CKEDITOR.NODE_ELEMENT&&E.getName()==G&&E.$.firstChild){E.trim();var M=E.getFirst();if(M.type==CKEDITOR.NODE_ELEMENT&&M.isBlockBoundary()){var N=new CKEDITOR.dom.documentFragment(z);E.moveChildren(N);E=N;}}var O=E.$.nodeName.toLowerCase();if(!CKEDITOR.env.ie&&(O=='div'||O=='p'))E.appendBogus();A.append(E);B=null;C++;}else return null;if(u.length<=C||Math.max(u[C].indent,0)<D)break;}if(v){var P=A.getFirst(),Q=u[0].parent;while(P){if(P.type==CKEDITOR.NODE_ELEMENT){CKEDITOR.dom.element.clearMarkers(v,P);if(P.getName() in CKEDITOR.dtd.$listItem)f(P);}P=P.getNextSourceNode();}}return{listNode:A,nextIndex:C};}};function g(u){if(u.editor.readOnly)return null;var v=u.data.path,w=v.blockLimit,x=v.elements,y,z;for(z=0;z<x.length&&(y=x[z])&&!y.equals(w);z++){if(a[x[z].getName()])return this.setState(this.type==x[z].getName()?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF);}return this.setState(CKEDITOR.TRISTATE_OFF);};function h(u,v,w,x){var y=CKEDITOR.plugins.list.listToArray(v.root,w),z=[];for(var A=0;A<v.contents.length;A++){var B=v.contents[A];B=B.getAscendant('li',true);if(!B||B.getCustomData('list_item_processed'))continue;z.push(B);CKEDITOR.dom.element.setMarker(w,B,'list_item_processed',true);}var C=v.root,D=C.getDocument().createElement(this.type);C.copyAttributes(D,{start:1,type:1});D.removeStyle('list-style-type');for(A=0;A<z.length;A++){var E=z[A].getCustomData('listarray_index');y[E].parent=D;}var F=CKEDITOR.plugins.list.arrayToList(y,w,null,u.config.enterMode),G,H=F.listNode.getChildCount();for(A=0;A<H&&(G=F.listNode.getChild(A));A++){if(G.getName()==this.type)x.push(G);}F.listNode.replace(v.root);};var i=/^h[1-6]$/;function j(u,v,w){var x=v.contents,y=v.root.getDocument(),z=[];if(x.length==1&&x[0].equals(v.root)){var A=y.createElement('div');x[0].moveChildren&&x[0].moveChildren(A);x[0].append(A);x[0]=A;}var B=v.contents[0].getParent();for(var C=0;C<x.length;C++)B=B.getCommonAncestor(x[C].getParent());var D=u.config.useComputedState,E,F;D=D===undefined||D;for(C=0;C<x.length;C++){var G=x[C],H;while(H=G.getParent()){if(H.equals(B)){z.push(G);if(!F&&G.getDirection())F=1;var I=G.getDirection(D);if(E!==null)if(E&&E!=I)E=null;else E=I;break;}G=H;}}if(z.length<1)return;var J=z[z.length-1].getNext(),K=y.createElement(this.type);w.push(K);var L,M;while(z.length){L=z.shift();
M=y.createElement('li');if(L.is('pre')||i.test(L.getName()))L.appendTo(M);else{L.copyAttributes(M);if(E&&L.getDirection()){M.removeStyle('direction');M.removeAttribute('dir');}L.moveChildren(M);L.remove();}M.appendTo(K);}if(E&&F)K.setAttribute('dir',E);if(J)K.insertBefore(J);else K.appendTo(B);};function k(u,v,w){var x=CKEDITOR.plugins.list.listToArray(v.root,w),y=[];for(var z=0;z<v.contents.length;z++){var A=v.contents[z];A=A.getAscendant('li',true);if(!A||A.getCustomData('list_item_processed'))continue;y.push(A);CKEDITOR.dom.element.setMarker(w,A,'list_item_processed',true);}var B=null;for(z=0;z<y.length;z++){var C=y[z].getCustomData('listarray_index');x[C].indent=-1;B=C;}for(z=B+1;z<x.length;z++){if(x[z].indent>x[z-1].indent+1){var D=x[z-1].indent+1-x[z].indent,E=x[z].indent;while(x[z]&&x[z].indent>=E){x[z].indent+=D;z++;}z--;}}var F=CKEDITOR.plugins.list.arrayToList(x,w,null,u.config.enterMode,v.root.getAttribute('dir')),G=F.listNode,H,I;function J(K){if((H=G[K?'getFirst':'getLast']())&&!(H.is&&H.isBlockBoundary())&&(I=v.root[K?'getPrevious':'getNext'](CKEDITOR.dom.walker.whitespaces(true)))&&!(I.is&&I.isBlockBoundary({br:1})))u.document.createElement('br')[K?'insertBefore':'insertAfter'](H);};J(true);J();G.replace(v.root);};function l(u,v){this.name=u;this.type=v;};function m(u){var v=u.getDirection();if(v){for(var w=0,x=u.getChildren(),y;y=x.getItem(w),w<x.count();w++){if(y.type==CKEDITOR.NODE_ELEMENT&&y.is('li')&&!y.getDirection())y.setAttribute('dir',v);}u.removeAttribute('dir');}};l.prototype={exec:function(u){var v=u.document,w=u.config,x=u.getSelection(),y=x&&x.getRanges(true);if(!y||y.length<1)return;if(this.state==CKEDITOR.TRISTATE_OFF){var z=v.getBody();if(!z.getFirst(e)){w.enterMode==CKEDITOR.ENTER_BR?z.appendBogus():y[0].fixBlock(1,w.enterMode==CKEDITOR.ENTER_P?'p':'div');x.selectRanges(y);}else{var A=y.length==1&&y[0],B=A&&A.getEnclosedNode();if(B&&B.is&&this.type==B.getName())this.setState(CKEDITOR.TRISTATE_ON);}}var C=x.createBookmarks(true),D=[],E={},F=y.createIterator(),G=0;while((A=F.getNextRange())&&++G){var H=A.getBoundaryNodes(),I=H.startNode,J=H.endNode;if(I.type==CKEDITOR.NODE_ELEMENT&&I.getName()=='td')A.setStartAt(H.startNode,CKEDITOR.POSITION_AFTER_START);if(J.type==CKEDITOR.NODE_ELEMENT&&J.getName()=='td')A.setEndAt(H.endNode,CKEDITOR.POSITION_BEFORE_END);var K=A.createIterator(),L;K.forceBrBreak=this.state==CKEDITOR.TRISTATE_OFF;while(L=K.getNextParagraph()){if(L.getCustomData('list_block'))continue;else CKEDITOR.dom.element.setMarker(E,L,'list_block',1);
var M=new CKEDITOR.dom.elementPath(L),N=M.elements,O=N.length,P=null,Q=0,R=M.blockLimit,S;for(var T=O-1;T>=0&&(S=N[T]);T--){if(a[S.getName()]&&R.contains(S)){R.removeCustomData('list_group_object_'+G);var U=S.getCustomData('list_group_object');if(U)U.contents.push(L);else{U={root:S,contents:[L]};D.push(U);CKEDITOR.dom.element.setMarker(E,S,'list_group_object',U);}Q=1;break;}}if(Q)continue;var V=R;if(V.getCustomData('list_group_object_'+G))V.getCustomData('list_group_object_'+G).contents.push(L);else{U={root:V,contents:[L]};CKEDITOR.dom.element.setMarker(E,V,'list_group_object_'+G,U);D.push(U);}}}var W=[];while(D.length>0){U=D.shift();if(this.state==CKEDITOR.TRISTATE_OFF){if(a[U.root.getName()])h.call(this,u,U,E,W);else j.call(this,u,U,W);}else if(this.state==CKEDITOR.TRISTATE_ON&&a[U.root.getName()])k.call(this,u,U,E);}for(T=0;T<W.length;T++){P=W[T];var X,Y=this;(X=function(Z){var aa=P[Z?'getPrevious':'getNext'](CKEDITOR.dom.walker.whitespaces(true));if(aa&&aa.getName&&aa.getName()==Y.type){if(aa.getDirection(1)!=P.getDirection(1))m(P.getDirection()?P:aa);aa.remove();aa.moveChildren(P,Z);}})();X(1);}CKEDITOR.dom.element.clearAllMarkers(E);x.selectBookmarks(C);u.focus();}};var n=CKEDITOR.dtd,o=/[\t\r\n ]*(?:&nbsp;|\xa0)$/;function p(u,v){var w,x=u.children,y=x.length;for(var z=0;z<y;z++){w=x[z];if(w.name&&w.name in v)return z;}return y;};function q(u){return function(v){var w=v.children,x=p(v,n.$list),y=w[x],z=y&&y.previous,A;if(z&&(z.name&&z.name=='br'||z.value&&(A=z.value.match(o)))){var B=z;if(!(A&&A.index)&&B==w[0])w[0]=u||CKEDITOR.env.ie?new CKEDITOR.htmlParser.text('\xa0'):new CKEDITOR.htmlParser.element('br',{});else if(B.name=='br')w.splice(x-1,1);else B.value=B.value.replace(o,'');}};};var r={elements:{}};for(var s in n.$listItem)r.elements[s]=q();var t={elements:{}};for(s in n.$listItem)t.elements[s]=q(true);CKEDITOR.plugins.add('list',{init:function(u){var v=u.addCommand('numberedlist',new l('numberedlist','ol')),w=u.addCommand('bulletedlist',new l('bulletedlist','ul'));u.ui.addButton('NumberedList',{label:u.lang.numberedlist,command:'numberedlist'});u.ui.addButton('BulletedList',{label:u.lang.bulletedlist,command:'bulletedlist'});u.on('selectionChange',CKEDITOR.tools.bind(g,v));u.on('selectionChange',CKEDITOR.tools.bind(g,w));},afterInit:function(u){var v=u.dataProcessor;if(v){v.dataFilter.addRules(r);v.htmlFilter.addRules(t);}},requires:['domiterator']});})();