<?xml version="1.0" encoding="ISO-8859-1"?>
<!--
    kOLEKTi : a structural documentation generator
    Copyright (C) 2007 St�phane Bonhomme (stephane@exselt.com)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


-->
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"   
  xmlns="http://www.w3.org/1999/xhtml" 
  xmlns:html="http://www.w3.org/1999/xhtml" 
  xmlns:kfp="kolekti:extensions:functions:publication"
  extension-element-prefixes="kfp" 
  exclude-result-prefixes="html kfp"
  version="1.0">

  <xsl:output  method="xml" 
               indent="yes"
               doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
               doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" />

  <!-- parametres d'entr�e : langue et basepath -->
  <xsl:variable name="criteria" select="kfp:criteria()"/>
  
  <xsl:template match="node()|@*">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="html:head">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*"/>
      <xsl:call-template name="lang" />
      <xsl:apply-templates select="$criteria"/>
    </xsl:copy>
  </xsl:template>

  <!-- copie les conditions dans les meta du pivot -->
  <xsl:template match="criterion[@code='__EXCL__']">
    <meta scheme="xcondition">
      <xsl:attribute name="name">__EXCL__</xsl:attribute>
      <xsl:attribute name="content">
        <xsl:value-of select="@value"/>
      </xsl:attribute>
    </meta>
  </xsl:template>

  <xsl:template match="criterion[@user='1']/v">
    <meta scheme="user_condition" name="{parent::criterion/@code}" content="{@value}"/>
  </xsl:template>

  <xsl:template match="criterion[@user='1']">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="criterion[@checked='1']">
    <meta scheme="condition" name="{@code}" content="{@value}"/>
  </xsl:template>

  <xsl:template name="lang">
    <meta scheme="condition" name="LANG">
      <xsl:attribute name="content">
        <xsl:value-of select="kfp:lang()"/>
      </xsl:attribute>
    </meta>
  </xsl:template>

</xsl:stylesheet>
