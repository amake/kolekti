<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:exsl="http://exslt.org/common"
  xmlns:kfp="kolekti:extensions:functions:publication"

  extension-element-prefixes="exsl kfp"
  exclude-result-prefixes="html exsl kfp">
  <xsl:output method="html" indent="yes" />

  <xsl:include href="alphaindex.xsl" />

  <xsl:param name="pubdir" />
  <xsl:param name="templatedir" />
  <xsl:param name="templatetrans" />
  <xsl:param name="template" />
  <xsl:param name="label" />
  <xsl:param name="css" />

  <xsl:variable name="helpname">WebHelp5</xsl:variable>
  <xsl:variable name="index" select="//html:ins[@class='index']|//html:span[@rel='index']" />
  <xsl:variable name="modules" select="//html:div[@class='module']" />


  <xsl:variable name="lang">
    <xsl:value-of select="/html:html/html:body/@lang" />
  </xsl:variable>

  <xsl:variable name="templatefile">
    <xsl:value-of select="$templatedir" />
    <xsl:value-of select="$template" />
  </xsl:variable>

  <xsl:variable name="translationfile">
    <xsl:choose>
      <xsl:when test="document($templatefile)//html:span[@id='labels']">
        <xsl:value-of select="document($templatefile)//html:span[@id='labels']" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$helpname" />
        <xsl:text>_labels</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="helptitle">
    <xsl:value-of select="kfp:replace_strvar(string(/html:html/html:head/html:title/text()))" />
  </xsl:variable>

  <xsl:variable name="starttopic">
    <xsl:choose>
      <xsl:when test="$modules/html:div[@class='moduleinfo']//html:span[@class='infolabel']='hlpstart'">
        <xsl:for-each select="$modules[html:div[@class='moduleinfo']//html:span[@class='infolabel']='hlpstart'][1]">
          <xsl:call-template name="modfile" />
        </xsl:for-each>
      </xsl:when>
      <xsl:when test="document($templatefile)//html:span[@id='start_topic']!=''">
        <xsl:value-of select="document($templatefile)//html:span[@id='start_topic']" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="modfile">
          <xsl:with-param name="modid" select="$modules[1]/@id" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <!-- main template -->

  <xsl:template match="/">
    <exsl:document href="{$pubdir}/js/modcodes.js" method='text'>
      var modcodes = new Object();
      <xsl:apply-templates select="html:html/html:body//html:div[@class='module']" mode="modcodes" />
    </exsl:document>
    <exsl:document href="{$pubdir}/js/modtexts.js" method='text'>
      var modtexts = new Object();
      <xsl:apply-templates select="$modules" mode="textcontent" />
    </exsl:document>
    <xsl:apply-templates select="$modules" />
    <!-- alphebtical index -->
    <xsl:if test="$index">
      <exsl:document href="{$pubdir}/alphaindex.html"
        method="html"
        indent="yes"
        encoding="utf-8">
        <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;&#10;</xsl:text>
        <html>
          <head>
            <xsl:call-template name="genhtmlheader" />
          </head>
          <body onload="init_help();">
            <xsl:call-template name="gennavbar" />
            <div class="container-fluid">
              <div class="row-fluid">
                <div class="span3">
                  <xsl:call-template name="gentoc" />
                </div>
                <div class="span9 offset2">
                  <div id="alphaindex">
                    <h2 id="alphaindextitle" class="page-header alphaindextitle">
                      <xsl:value-of select="kfp:variable(string($translationfile),'AlphaIndexTitre')" />
                    </h2>
                    <div id="alphaindexcontent" class="alphaindexcontent">
                      <xsl:call-template name="alphabetical-index" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      </exsl:document>
    </xsl:if>
  </xsl:template>

  <xsl:template match="html:div[@class='module']" mode="modcodes">
    <xsl:variable name="modcode">
      <xsl:call-template name="modfile" />
    </xsl:variable>
    <xsl:variable name="modt">
      <xsl:call-template name="modtitle" />
    </xsl:variable>
    <xsl:variable name="modtitle">
      <xsl:for-each select="ancestor::html:div[@class='section']">
        <xsl:sort order="ascending" select="count(ancestor::*)"/>
        <xsl:if test="not(position()=1)">
          <xsl:copy-of select="html:*[1]/text()"/>
          <!--        <xsl:if test="position()!=last() or $modt!=''"> -->
          <xsl:text> / </xsl:text>
          <!--        </xsl:if>-->
        </xsl:if>
      </xsl:for-each>
      <xsl:value-of select="$modt"/>
    </xsl:variable>
    <xsl:text>modcodes['</xsl:text>
    <xsl:value-of select="$modcode" />
    <xsl:text>']='</xsl:text>
    <xsl:call-template name="trquot">
      <xsl:with-param name="text" select="$modtitle" />
    </xsl:call-template>
    <xsl:text>';&#x0A;</xsl:text>
  </xsl:template>

  <xsl:template match="html:div[@class='module']" mode="textcontent">
    <xsl:variable name="filename">
      <xsl:call-template name="modfile" />
    </xsl:variable>
    <xsl:text>modtexts['</xsl:text>
    <xsl:value-of select="$filename" />
    <xsl:text>'] = '</xsl:text>
    <xsl:apply-templates mode="textcontent" select="node()[not(@class='moduleinfo')]" />
    <xsl:text>';&#x0A;</xsl:text>
  </xsl:template>

  <xsl:template match="text()" mode="textcontent">
    <xsl:call-template name="trquot">
      <xsl:with-param name="text" select="normalize-space(.)" />
    </xsl:call-template>
    <xsl:text> </xsl:text>
  </xsl:template>

  <xsl:template match="html:span[@class='title_num']" mode="textcontent"/>
  <xsl:template match="html:div[@class='moduleinfo']" mode="textcontent"/>

  <xsl:template match="html:div[@class='module']">
    <xsl:variable name="filename">
      <xsl:call-template name="modfile" />
    </xsl:variable>
    <exsl:document href="{$pubdir}/{$filename}"
      method="html"
      indent="yes"
      encoding="utf-8">
      <xsl:variable name="modtitle">
        <xsl:call-template name="modtitle" />
      </xsl:variable>
      <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;&#10;</xsl:text>
      <html>
        <head>
          <xsl:call-template name="genhtmlheader" />
        </head>
        <body onload="init_help();">
          <xsl:call-template name="gennavbar" />
          <div class="container-fluid">

            <div class="row-fluid">
              <div class="span3" id="k-menu">
                <xsl:call-template name="gentoc">
                  <xsl:with-param name="modtitle" select="$modtitle"/>
                </xsl:call-template>
              </div>
              <div class="span9" id="k-main">
                <xsl:if test="not(html:div[@class='moduleinfo']/html:p[html:span[@class='infolabel']='kolekti:module-template']/html:span[@class='infovalue'][text()='frontcover'])">
                  <div class="row-fluid">
                    <div class="span9" id="k-breadcrumbs">
                      <xsl:if test="count(ancestor::html:div[@class='section']) &gt; 1">
                        <ul class="breadcrumb">
                          <xsl:apply-templates select="ancestor::html:div[@class='section']" mode="breadcrumb">
                            <xsl:sort order="descending" />
                            <xsl:with-param name="modtitle" select="$modtitle"/>
                          </xsl:apply-templates>
                          <li class="active"><xsl:value-of select="$modtitle" /></li>
                        </ul>
                      </xsl:if>
                      <xsl:text>&#xA0;</xsl:text>
                    </div>
                    <div class="span3"  id="k-navhead">
                      <xsl:call-template name="topicnavbar"/>
                    </div>
                  </div><!--row-->
                </xsl:if>
                <div class="row-fluid" id="k-topic">
                  <div class="span9">
                    <xsl:variable name="topicheader" select="document($templatefile)//html:div[@id='tete_topic']" />
                    <xsl:if test="normalize-space($topicheader) != ''">
                      <div class="page-header">
                        <xsl:copy-of select="$topicheader" />
                      </div>
                    </xsl:if>
                    <div id="k-topiccontent">
                      <xsl:apply-templates select="*[not(@class='moduleinfo')]" mode="modcontent" />
                    </div>
                  </div>
                  <div class="span3" id="k-topictools">
                    <!--tools-->
                    <p>&#xA0;</p>
                  </div>
                </div>

                <!-- topic bottom -->
                <div class="row-fluid" style="margin-top: 2em;">
                  <div class="span9" id="k-topicfooter">
                    <div class="breadcrumb">
                      <xsl:copy-of select="document($templatefile)//html:div[@id='pied_topic']/*" />
                    </div>
                  </div>
                  <div class="span3"  id="k-navfoot">
                    <xsl:call-template name="topicnavbar" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    </exsl:document>
  </xsl:template>

  <xsl:template match="html:div[@class='section']" mode="gennavbar">
    <xsl:variable name="modref">
      <xsl:call-template name="modfile">
        <xsl:with-param name="modid" select=".//html:div[@class='module'][1]/@id" />
      </xsl:call-template>
    </xsl:variable>
    <li class="dropdown">
      <a href="{$modref}" class="dropdown-toggle" data-toggle="dropdown">
        <xsl:copy-of select="html:*[1]/node()" />
        <b class="caret"></b>
      </a>
      <ul class="dropdown-menu"><xsl:apply-templates select="html:div[@class='section' or @class='module']" mode="gennavbar" /></ul>
    </li>
  </xsl:template>

  <xsl:template match="html:div[@class='module']" mode="gennavbar">
    <xsl:variable name="modref">
      <xsl:call-template name="modfile" />
    </xsl:variable>
    <li>
      <a href="{$modref}">
        <xsl:call-template name="modtitle" />
      </a>
    </li>
  </xsl:template>

  <xsl:template match="html:div[@class='section']" mode="navlist">
    <xsl:param name="modid" />
    <xsl:param name="modtitle" />

    <xsl:variable name="modref">
      <xsl:call-template name="modfile">
        <xsl:with-param name="modid" select="(.//html:div[@class='module'])[1]/@id" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="cursection" select="boolean(.//html:div[@id = $modid])" />
    <li>
      <xsl:if test="./html:div[@id = $modid] and $modtitle=''">
        <xsl:attribute name="class">
          <xsl:text>active</xsl:text>
        </xsl:attribute>
      </xsl:if>
      <a href="{$modref}">
        <i>
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="$cursection"><xsl:text>icon-folder-open</xsl:text></xsl:when>
              <xsl:otherwise><xsl:text>icon-folder-close</xsl:text></xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        </i>
        <strong><xsl:copy-of select="html:*[1]/node()"/></strong>
      </a>
    </li>
    <xsl:if test="$cursection">
      <ul class="nav nav-list">
        <xsl:apply-templates select="html:div[@class='section' or @class='module']" mode="navlist">
          <xsl:with-param name="modid" select="$modid" />
          <xsl:with-param name="modtitle" select="$modtitle" />
        </xsl:apply-templates>
      </ul>
    </xsl:if>
  </xsl:template>


  <xsl:template match="html:div[@class='module']" mode="navlist">
    <xsl:param name="modid" />
    <xsl:param name="modtitle" />
    <xsl:variable name="modref">
      <xsl:call-template name="modfile" />
    </xsl:variable>
    <xsl:variable name="thismodtitle">
      <xsl:call-template name="modtitle" />
    </xsl:variable>
    <xsl:if test="not($thismodtitle='')">
      <li>
        <xsl:if test="@id = $modid">
          <xsl:attribute name="class">
            <xsl:text>active</xsl:text>
          </xsl:attribute>
        </xsl:if>
        <a href="{$modref}"><i class="icon-file"></i><xsl:value-of select="$thismodtitle" /></a>
      </li>
    </xsl:if>
  </xsl:template>

  <xsl:template match="html:div[@class='section']" mode="breadcrumb">
    <xsl:param name="modtitle" />
    <xsl:variable name="modref">
      <xsl:call-template name="modfile">
        <xsl:with-param name="modid" select="html:div[@class='module'][1]/@id" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="position()=last() and $modtitle=''">
        <li>
          <xsl:copy-of select="html:*[1]/node()" />
        </li>
      </xsl:when>
      <xsl:otherwise>
        <li>
          <a href="{$modref}"><xsl:copy-of select="html:*[1]/node()" /></a><span class="divider">/</span>
        </li>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="html:h1|html:h2|html:h3|html:h4|html:h5|html:h6" mode="modcontent">
    <xsl:variable name="currentlvl" select="substring-after(local-name(),'h')" />
    <xsl:variable name="sectionlvl" select="count(ancestor::html:div[@class='section'])" />
    <xsl:variable name="newlvl" select="$currentlvl - ($sectionlvl -1)" />
    <xsl:choose>
      <xsl:when test="$newlvl = 2">
        <div class="page-header">
          <xsl:element name="h{$newlvl}" namespace="http://www.w3.org/1999/xhtml">
            <xsl:apply-templates select="node()|@*" mode="modcontent" />
          </xsl:element>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <xsl:element name="h{$newlvl}" namespace="http://www.w3.org/1999/xhtml">
          <xsl:apply-templates select="node()|@*" mode="modcontent" />
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="html:a[@href='#']" mode="modcontent">
    <xsl:apply-templates select="node()" mode="modcontent" />
  </xsl:template>

  <xsl:template match="html:a[@href!='#'][starts-with(@href,'#')]" mode="modcontent">
    <xsl:copy>
      <xsl:apply-templates select="@*" mode="modcontent" />
      <xsl:attribute name="href">
        <xsl:call-template name="modhref">
          <xsl:with-param name="modid" select="substring-after(@href,'#')" />
        </xsl:call-template>
      </xsl:attribute>
      <xsl:apply-templates select="node()" mode="modcontent" />
    </xsl:copy>
  </xsl:template>

  <xsl:template match="html:a[@href!='#'][not(starts-with(@href,'#'))]">
    <xsl:copy>
      <xsl:apply-templates select="@*" mode="modcontent" />
      <xsl:attribute name="target">_blank</xsl:attribute>
      <xsl:apply-templates select="node()" mode="modcontent" />
    </xsl:copy>
  </xsl:template>

  <xsl:template match="html:img" mode="modcontent">
    <xsl:variable name="src">
      <xsl:choose>
        <xsl:when test="starts-with(@src, 'http://')">
          <xsl:value-of select="@src" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>medias/</xsl:text>
          <xsl:value-of select="substring-after(@src, 'medias/')" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <img src="{$src}" alt="{@alt}" title="{@title}">
      <xsl:if test="@style">
        <xsl:attribute name="style"><xsl:value-of select="@style" /></xsl:attribute>
      </xsl:if>
    </img>
  </xsl:template>

  <xsl:template match="html:embed" mode="modcontent">
    <xsl:variable name="src">
      <xsl:choose>
        <xsl:when test="starts-with(@src, 'http://')">
          <xsl:value-of select="@src" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>medias/</xsl:text>
          <xsl:value-of select="substring-after(@src, 'medias/')" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <embed width="{@width}" height="{@height}" type="{@type}" pluginspage="{@pluginspage}" src="{$src}" />
  </xsl:template>

  <xsl:template match="node()|@*" mode="modcontent">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*" mode="modcontent" />
    </xsl:copy>
  </xsl:template>

  <xsl:template match="html:a[@class='indexmq']" mode="modcontent" />

  <xsl:template match="html:div[@class='cover-titles']" mode="modcontent" >
    <div class="hero-unit">
      <div class="row-fluid">
        <div class="span8">
          <xsl:apply-templates select="html:*[@class='cover-title']" mode="modcontent"/>
          <xsl:apply-templates select="html:*[@class='cover-subtitle']" mode="modcontent"/>
        </div>
        <div class="span4">
          <xsl:apply-templates select="html:*[@class='cover-author']" mode="modcontent"/>
        </div>
      </div>
      <hr class="soften"/>
      <xsl:apply-templates select="html:*[not(@class='cover-title' or @class='cover-subtitle' or @class='cover-author')]" mode="covercontent"/>
      
    </div>
  </xsl:template>

  <xsl:template match="html:*[@class='cover-title']" mode="modcontent">   
  <h1><xsl:apply-templates mode="modcontent"/></h1>
</xsl:template>

<xsl:template match="html:*[@class='cover-subtitle']" mode="modcontent">
  <p><xsl:apply-templates  mode="modcontent"/></p>
</xsl:template>

<xsl:template match="html:*[@class='cover-author']" mode="modcontent">
  <p>By <xsl:apply-templates mode="modcontent"/></p>
</xsl:template>

<xsl:template match="html:*[@class='cover-editor']" mode="modcontent">
  <p><em><xsl:apply-templates mode="modcontent"/></em></p>
</xsl:template>

<xsl:template match="html:div[@class='cover-info']" mode="modcontent" >
  <div class="alert">
    <xsl:apply-templates mode="modcontent" />
  </div>
</xsl:template>

<xsl:template match="html:span[@class='title_num']" mode="TOCtitle" />
<xsl:template match="html:ins[@class='index']|html:span[@rel='index']" mode="TOCtitle" />

<!-- generate topic navbar -->
<xsl:template name="topicnavbar">
  <div class="btn-group pull-right">
    <a title="{kfp:variable(string($translationfile),'premier')}">
      <xsl:attribute name="class">
        <xsl:text>btn</xsl:text>
        <xsl:if test="not(preceding::html:div[@class='module'])">
          <xsl:text> disabled</xsl:text>
        </xsl:if>
      </xsl:attribute>
      <xsl:attribute name="href">
        <xsl:call-template name="modfile">
          <xsl:with-param name="modid" select="//html:div[@class='module'][1]/@id"/>
        </xsl:call-template>
      </xsl:attribute>
      <i class="icon-home"></i>
    </a>
    <a title="{kfp:variable(string($translationfile),'precedent')}">
      <xsl:attribute name="class">
        <xsl:text>btn</xsl:text>
        <xsl:if test="not(preceding::html:div[@class='module'])">
          <xsl:text> disabled</xsl:text>
        </xsl:if>
      </xsl:attribute>
      <xsl:attribute name="href">
        <xsl:call-template name="modfile">
          <xsl:with-param name="modid" select="preceding::html:div[@class='module'][1]/@id" />
        </xsl:call-template>
      </xsl:attribute>
      <i class="icon-chevron-left"></i>
    </a>

    <a title="{kfp:variable(string($translationfile),'suivant')}">
      <xsl:attribute name="class">
        <xsl:text>btn</xsl:text>
        <xsl:if test="not(following::html:div[@class='module'])">
          <xsl:text> disabled</xsl:text>
        </xsl:if>
      </xsl:attribute>
      <xsl:attribute name="href">
        <xsl:call-template name="modfile">
          <xsl:with-param name="modid" select="following::html:div[@class='module'][1]/@id" />
        </xsl:call-template>
      </xsl:attribute>
      <i class="icon-chevron-right"></i>
    </a>
    <!-- <a class="btn" title="{kfp:variable(string($translationfile),'dernier')}">
         <xsl:attribute name="href">
           <xsl:call-template name="modfile">
             <xsl:with-param name="modid" select="current()[not(following::html:div[@class='module'])]/@id|following::html:div[@class='module'][last()]/@id" />
           </xsl:call-template>
         </xsl:attribute>
         <i class="icon-step-forward"></i>
       </a>-->
       <span class="btn" title="{kfp:variable(string($translationfile),'imprimer')}" onclick="window.print();"><i class="icon-print"></i></span>
       <!-- <span class="btn" title="{kfp:variable(string($translationfile),'signet')}" onclick="addbookmark();"><i class="icon-star-empty"></i></span> -->
     </div>
   </xsl:template>

   <!--  generate html header -->
   <xsl:template name="genhtmlheader">
     <title><xsl:apply-templates select="/html:html/html:body/html:div[@class='section'][1]/html:*[1]/text()" /></title>
     <meta charset="utf-8" />
     <meta content="width=device-width, initial-scale=1.0" name="viewport" />
     <link rel="stylesheet" href="lib/css/bootstrap.min.css" type="text/css"/>
     <link rel="stylesheet" href="lib/css/bootstrap-responsive.min.css" type="text/css"/>
     <link rel="stylesheet" href="lib/css/WebHelp5.css" type="text/css"/>
     <xsl:if test="$css">
       <link rel="stylesheet" href="usercss/{$css}.css" type="text/css" />
     </xsl:if>
     <script src="lib/js/jquery-1.7.1.min.js" type="text/javascript">
       <xsl:text>&#x0D;</xsl:text>
     </script>
     <script src="lib/js/bootstrap.min.js" type="text/javascript">
       <xsl:text>&#x0D;</xsl:text>
     </script>

     <script src="js/modcodes.js" type="text/javascript">
       <xsl:text>&#x0D;</xsl:text>
     </script>
     <script src="js/modtexts.js" type="text/javascript">
       <xsl:text>&#x0D;</xsl:text>
     </script>
     <script src="js/index.js" type="text/javascript">
       <xsl:text>&#x0D;</xsl:text>
     </script>
     <script src="lib/js/search.js" type="text/javascript">
       <xsl:text>&#x0D;</xsl:text>
     </script>

     <script type="text/javascript">
       var label_score="<xsl:call-template name="gettext"><xsl:with-param name="label" select="'score'" /></xsl:call-template>";
     var label_moreres="<xsl:call-template name="gettext"><xsl:with-param name="label" select="'plus10res'" /></xsl:call-template>";
   </script>
   <xsl:text disable-output-escaping='yes'>&lt;!--[if lt IE 9]&gt;</xsl:text>
   <script src="http://html5shim.googlecode.com/svn/trunk/html5.js" type="text/javascript">
     <xsl:text>&#x0D;</xsl:text>
   </script>
   <xsl:text disable-output-escaping='yes'>&lt;![endif]--&gt;</xsl:text>
   <style type="text/css">
     body {
     padding-top: 60px;
     padding-bottom: 40px;
     }
     .sidebar-nav {
     padding: 9px 0;
     }
   </style>
 </xsl:template>

 <!-- generate navbar -->
 <xsl:template name="gennavbar">
   <div id="header" class="navbar navbar-fixed-top">
     <div class="navbar-inner">
       <div class="container-fluid">
         <!-- .btn-navbar is used as the toggle for collapsed navbar content -->
         <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
           <span class="icon-bar"></span>
           <span class="icon-bar"></span>
           <span class="icon-bar"></span>
         </a>
         <a href="index.html" class="brand">
           <xsl:copy-of select="/html:html/html:body/html:div[@class='section'][1]/html:*[1]/node()" />
         </a>

         <div class="nav-collapse">
           <ul class="nav">
             <xsl:for-each select="/html:html/html:body/html:div[@class='section'][position() &gt; 1]">
               <xsl:variable name="modref">
                 <xsl:call-template name="modfile">
                   <xsl:with-param name="modid" select="html:div[@class='module'][1]/@id" />
                 </xsl:call-template>
               </xsl:variable>
               <li class="dropdown">
                 <a href="{$modref}" class="dropdown-toggle" data-toggle="dropdown">
                   <xsl:copy-of select="html:*[1]/node()" />
                   <b class="caret"></b>
                 </a>
                 <ul class="dropdown-menu"><xsl:apply-templates select="html:div[@class='section' or @class='module']" mode="gennavbar" /></ul>
               </li>
             </xsl:for-each>
             <xsl:if test="$index">
               <li>
                 <a href="alphaindex.html"><xsl:value-of select="kfp:variable(string($translationfile),'AlphaIndexTitre')" /></a>
               </li>
             </xsl:if>
           </ul>
           <div class="navbar-search pull-right">
             <div class="dropdown" id="ksearcharea">
               <input type="text" 
                 class="dropdown-toggle search-query"
                 id="ksearchinput"
                 placeholder="{kfp:variable(string($translationfile),'SearchTitre')}"  
                 data-toggle="dropdown"/>
               <ul class="dropdown-menu"
                 id="ksearchmenu">
                 <li><a><em>Search Results</em></a></li>
               </ul>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 </xsl:template>

 <!-- generate TOC -->
 <xsl:template name="gentoc">
   <xsl:param name="modid" select="@id" />
   <xsl:param name="modtitle" select="''" />
   <div id="menu" class="well sidebar-nav">
     <ul class="nav nav-list">
       <xsl:apply-templates select="/html:html/html:body/html:div[@class='section' or @class='module']  " mode="navlist">
         <xsl:with-param name="modid" select="$modid" />
         <xsl:with-param name="modtitle" select="$modtitle" />
       </xsl:apply-templates>
     </ul>
   </div>
 </xsl:template>

 <!-- module title -->
 <xsl:template name="modtitle">
   <xsl:apply-templates select="(.//html:h1|.//html:h2|.//html:h3|.//html:h4|.//html:h5|.//html:h6|.//html:dt)[1]" mode="TOCtitle" />
 </xsl:template>

 <!-- module filename -->
 <xsl:template name="modfile">
   <xsl:param name="modid">
     <xsl:value-of select="@id" />
   </xsl:param>
   <xsl:variable name="mod" select="//html:div[@id = $modid]" />
   <xsl:choose>
     <xsl:when test="not($mod/preceding::html:div[@class='module'][1])">
       <xsl:text>index</xsl:text>
     </xsl:when>
     <xsl:when test="$mod/html:div[@class='moduleinfo']/html:p[html:span[@class='infolabel']='topic_file']">
       <xsl:value-of select="$mod/html:div[@class='moduleinfo']/html:p[html:span[@class='infolabel']='topic_file']/html:span[@class='infovalue']" />
     </xsl:when>
     <xsl:otherwise>
       <xsl:value-of select="$modid" />
     </xsl:otherwise>
   </xsl:choose>
   <xsl:text>.html</xsl:text>
 </xsl:template>

 <!--  module link -->
 <xsl:template name="modhref">
   <xsl:param name="modid" />
   <xsl:variable name="topid">
     <xsl:choose>
       <xsl:when test="contains($modid,'_')">
         <xsl:value-of select="substring-before($modid,'_')" />
       </xsl:when>
       <xsl:otherwise>
         <xsl:value-of select="$modid" />
       </xsl:otherwise>
     </xsl:choose>
   </xsl:variable>
   <xsl:variable name="mod" select="//html:div[@id = $topid]" />
   <xsl:choose>
     <xsl:when test="not($mod/preceding::html:div[@class='module'][1])">
       <xsl:text>index</xsl:text>
     </xsl:when>
     <xsl:when test="$mod/html:div[@class='moduleinfo']/html:p[html:span[@class='infolabel']='topic_file']">
       <xsl:value-of select="$mod/html:div[@class='moduleinfo']/html:p[html:span[@class='infolabel']='topic_file']/html:span[@class='infovalue']" />
     </xsl:when>
     <xsl:otherwise>
       <xsl:value-of select="$topid" />
     </xsl:otherwise>
   </xsl:choose>
   <xsl:text>.html</xsl:text>
   <xsl:if test="contains($modid,'_')">
     <xsl:text>#</xsl:text>
     <xsl:value-of select="$modid" />
   </xsl:if>
 </xsl:template>

 <!-- fixed slashes -->
 <xsl:template name="slashes">
   <xsl:param name="text" />
   <xsl:choose>
     <xsl:when test="contains($text,'\')">
       <xsl:value-of select="substring-before($text,'\')" />
       <xsl:text>/</xsl:text>
       <xsl:call-template name="slashes">
         <xsl:with-param name="text" select="substring-after($text,'\')" />
       </xsl:call-template>
     </xsl:when>
     <xsl:otherwise>
       <xsl:value-of select="$text" />
     </xsl:otherwise>
   </xsl:choose>
 </xsl:template>

 <!-- quote text -->
 <xsl:template name="trquot">
   <xsl:param name="text" />
   <xsl:choose>
     <xsl:when test='contains($text,"&apos;")'>
       <xsl:value-of select='substring-before($text,"&apos;")' />
       <xsl:text>\&apos;</xsl:text>
       <xsl:call-template name="trquot">
         <xsl:with-param name="text" select='substring-after($text,"&apos;")' />
       </xsl:call-template>
     </xsl:when>
     <xsl:when test='contains($text, "&#xa;")'>
       <xsl:value-of select='substring-before($text,"&#xa;")' />
       <xsl:text> </xsl:text>
       <xsl:call-template name="trquot">
         <xsl:with-param name="text" select='substring-after($text,"&#xa;")' />
       </xsl:call-template>
     </xsl:when>
     <xsl:when test='contains($text,"&#x0A;")'>
       <xsl:value-of select='substring-before($text,"&#x0A;")' />
       <xsl:text> </xsl:text>
       <xsl:call-template name="trquot">
         <xsl:with-param name="text" select='substring-after($text,"&#x0A;")' />
       </xsl:call-template>
     </xsl:when>
     <xsl:otherwise>
       <xsl:value-of select="$text" />
     </xsl:otherwise>
   </xsl:choose>
 </xsl:template>

 <!-- get translations -->
 <xsl:template name="gettext">
   <xsl:param name="label" />
   <xsl:value-of select="kfp:variable(string($translationfile),string($label))" />
 </xsl:template>
</xsl:stylesheet>