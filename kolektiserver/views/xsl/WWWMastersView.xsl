<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml"
                xmlns:i="kolekti:i18n"
                xmlns:kf="kolekti:extensions:functions"
                xmlns:ke="kolekti:extensions:elements"
                xmlns:kcd="kolekti:ctrdata"
                xmlns:kd="kolekti:dialogs"

                extension-element-prefixes="ke"
                exclude-result-prefixes="i kf ke kcd kd">

  <xsl:import href="WWWProjectView.xsl"/>

  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="currenttab">masters</xsl:variable>
  <xsl:template name="tabtitle"> - <i:text>[0020]Enveloppes</i:text></xsl:template>

  <xsl:template name="mainleft">
   <kd:ajaxbrowser id="mastersbrowser" showtab="true">
      <kd:layout>
        <kd:files />
        <!-- properties to display in browser -->
        <kd:property ns="DAV:" propname="getcontentlength" />
        <kd:property ns="DAV:" propname="getlastmodified" />
        <kd:property ns="DAV:" propname="creationdate" />
        <kd:property ns="DAV:" propname="lockdiscovery" />
      </kd:layout>

      <kd:behavior>
        <kd:click id="displaymaster" action="notify" event="resource-display-open" />
      </kd:behavior>

      <kd:actions>
        <kd:action ref="uploadmaster" />
        <kd:action ref="delete" />
      </kd:actions>

      <kd:tab i:label="[0152]Explorateur" dir="{$projectdir}/masters" id="masters" />
    </kd:ajaxbrowser>
  </xsl:template>

  <xsl:template name="mainright">
    <kd:resourceview id="mastersviewer" class="projectresview">
      <kd:use class="masterviewer">
         <kd:action ref="getmaster" />
         <kd:action ref="publishmaster" />
      </kd:use>
    </kd:resourceview>
    <div id="publish_dialog">
      <div class="publication_log"><xsl:text>&#x0D;</xsl:text></div>
      <div class="publication_result"><xsl:text>&#x0D;</xsl:text></div>
    </div>
  </xsl:template>
</xsl:stylesheet>