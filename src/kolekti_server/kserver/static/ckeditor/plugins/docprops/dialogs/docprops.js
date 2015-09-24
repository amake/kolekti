﻿/*
 Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.dialog.add("docProps",function(g){function i(){var a=this.getDialog().getContentElement("general",this.id+"Other");a&&("other"==this.getValue()?(a.getInputElement().removeAttribute("readOnly"),a.focus(),a.getElement().removeClass("cke_disabled")):(a.getInputElement().setAttribute("readOnly",!0),a.getElement().addClass("cke_disabled")))}function j(a,l,b){return function(c,d,f){d=k;c="undefined"!=typeof b?b:this.getValue();!c&&a in d?d[a].remove():c&&a in d?d[a].setAttribute("content",c):c&&
(d=new CKEDITOR.dom.element("meta",g.document),d.setAttribute(l?"http-equiv":"name",a),d.setAttribute("content",c),f.append(d))}}function h(a,b){return function(){var e=k,e=a in e?e[a].getAttribute("content")||"":"";if(b)return e;this.setValue(e);return null}}var b=g.lang.docprops,f=g.lang.common,k={};encodeURIComponent("document.open();"+(CKEDITOR.env.ie?"("+CKEDITOR.tools.fixDomain+")();":"")+'document.write( \'<html style="background-color: #ffffff; height: 100%"><head></head><body style="width: 100%; height: 100%; margin: 0px">'+
b.previewHtml+"</body></html>' );document.close();");return{title:b.title,minHeight:330,minWidth:500,onShow:function(){for(var a=g.document,b=a.getElementsByTag("html").getItem(0),e=a.getHead(),c=a.getBody(),d={},f=a.getElementsByTag("meta","*"),j=f.count(),h=0;h<j;h++){var i=f.getItem(h);d[i.getAttribute(i.hasAttribute("http-equiv")?"http-equiv":"name").toLowerCase()]=i}k=d;this.setupContent(a,b,e,c)},onHide:function(){k={}},onOk:function(){var a=g.document,b=a.getElementsByTag("html").getItem(0),
e=a.getHead(),c=a.getBody();this.commitContent(a,b,e,c)},contents:[{id:"general",label:f.generalTab,elements:[{type:"text",id:"title",label:b.docTitle,setup:function(a){this.setValue(a.getElementsByTag("title").getItem(0).data("cke-title"))},commit:function(a,b,e,c,d){d||a.getElementsByTag("title").getItem(0).data("cke-title",this.getValue())}},{type:"hbox",children:[{type:"select",id:"dir",label:f.langDir,style:"width: 100%",items:[[f.notSet,""],[f.langDirLtr,"ltr"],[f.langDirRtl,"rtl"]],setup:function(a,
b,e,c){this.setValue(c.getDirection()||"")},commit:function(a,b,e,c){(a=this.getValue())?c.setAttribute("dir",a):c.removeAttribute("dir");c.removeStyle("direction")}},{type:"text",id:"langCode",label:f.langCode,setup:function(a,b){this.setValue(b.getAttribute("xml:lang")||b.getAttribute("lang")||"")},commit:function(a,b,e,c,d){d||((a=this.getValue())?b.setAttributes({"xml:lang":a,lang:a}):b.removeAttributes({"xml:lang":1,lang:1}))}}]},{type:"hbox",children:[{type:"select",id:"charset",label:b.charset,
style:"width: 100%",items:[[f.notSet,""],[b.charsetASCII,"us-ascii"],[b.charsetCE,"iso-8859-2"],[b.charsetCT,"big5"],[b.charsetCR,"iso-8859-5"],[b.charsetGR,"iso-8859-7"],[b.charsetJP,"iso-2022-jp"],[b.charsetKR,"iso-2022-kr"],[b.charsetTR,"iso-8859-9"],[b.charsetUN,"utf-8"],[b.charsetWE,"iso-8859-1"],[b.other,"other"]],"default":"",onChange:function(){this.getDialog().selectedCharset="other"!=this.getValue()?this.getValue():"";i.call(this)},setup:function(){this.metaCharset="charset"in k;var a=h(this.metaCharset?
"charset":"content-type",1,1).call(this);!this.metaCharset&&a.match(/charset=[^=]+$/)&&(a=a.substring(a.indexOf("=")+1));if(a){this.setValue(a.toLowerCase());if(!this.getValue()){this.setValue("other");var b=this.getDialog().getContentElement("general","charsetOther");b&&b.setValue(a)}this.getDialog().selectedCharset=a}i.call(this)},commit:function(a,b,e,c,d){d||(c=this.getValue(),d=this.getDialog().getContentElement("general","charsetOther"),"other"==c&&(c=d?d.getValue():""),c&&!this.metaCharset&&
(c=(k["content-type"]?k["content-type"].getAttribute("content").split(";")[0]:"text/html")+"; charset="+c),j(this.metaCharset?"charset":"content-type",1,c).call(this,a,b,e))}},{type:"text",id:"charsetOther",label:b.charsetOther,onChange:function(){this.getDialog().selectedCharset=this.getValue()}}]},{type:"hbox",children:[{type:"select",id:"docType",label:b.docType,style:"width: 100%",items:[[f.notSet,""],["XHTML 1.1",'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'],
["XHTML 1.0 Strict",'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">']],onChange:i,setup:function(){if(g.docType&&(this.setValue(g.docType),!this.getValue())){this.setValue("other");var a=this.getDialog().getContentElement("general","docTypeOther");a&&a.setValue(g.docType)}i.call(this)},commit:function(a,b,e,c,d){d||(a=this.getValue(),b=this.getDialog().getContentElement("general","docTypeOther"),g.docType="other"==a?b?b.getValue():"":
a)}},{type:"text",id:"docTypeOther",label:b.docTypeOther}]},{type:"checkbox",id:"xhtmlDec",label:b.xhtmlDec,setup:function(){this.setValue(!!g.xmlDeclaration)},commit:function(a,b,e,c,d){d||(this.getValue()?(g.xmlDeclaration='<?xml version="1.0" encoding="'+(this.getDialog().selectedCharset||"utf-8")+'"?>',b.setAttribute("xmlns","http://www.w3.org/1999/xhtml")):(g.xmlDeclaration="",b.removeAttribute("xmlns")))}}]},{id:"meta",label:b.meta,elements:[{type:"textarea",id:"metaKeywords",label:b.metaKeywords,
setup:h("keywords"),commit:j("keywords")},{type:"textarea",id:"metaDescription",label:b.metaDescription,setup:h("description"),commit:j("description")},{type:"text",id:"metaAuthor",label:b.metaAuthor,setup:h("author"),commit:j("author")},{type:"text",id:"metaCopyright",label:b.metaCopyright,setup:h("copyright"),commit:j("copyright")},{type:"text",id:"metaTopicFile",label:b.metaTopicFile,setup:h("topic_file"),commit:j("topic_file")}]}]}});