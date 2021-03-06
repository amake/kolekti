# -*- coding: utf-8 -*-
#     kOLEKTi : a structural documentation generator
#     Copyright (C) 2007-2011 Stéphane Bonhomme (stephane@exselt.com)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.



import os
import time
import urllib

from lxml import etree as ET
from PIL import Image
from StringIO import StringIO

from _odt import odtpdf
import pluginBase

MFNS="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"

def getid(iter):
    return "10000000000%8X%05X"%(int(time.strftime('6013670%Y%m%d%M%S')),iter)

class plugin(pluginBase.plugin):
    """
    Plugin for odt publication

    Injects the content of the pivot file into an odt template
    The way xhtml is converted into odt is defined :
    - by a xslt preprocessing of the xhtml file : design/publication/opendocument/[theme]/filter.xsl
    - by a set of conversion mapping rules design/publication/opendocument/[theme]/mapping.xml
    """

    _META_= {
        "templates":"design/publication/opendocument",
        "add_to_projects":True,
        "parameters":''
        }

    def postpub(self):
        # get some context
        pubpath = self.pubdir +"/"+label
        
        pivfile=os.path.join(pubpath,"%s.xml"%self.publisher.model.abstractIO.unicode2local(self.publisher.pivname))
        tplpath = self._META_.get("templates")
        dfile=StringIO()
        #dfile=os.path.join(pubpath,"%s.odt"%self.label)
        theme = self.params.get('template','default')

        # get the theme elements for publishing

        tfile=os.path.join(self.publisher.model.projectpath,tplpath,"%s.ott" %theme)
        mapfile=os.path.join(self.publisher.model.projectpath,tplpath,theme,"mapping.xml")
        #coverfile=os.path.join(self.publisher.model.projectpath,tplpath,theme,"cover.xsl")
        filterfile=os.path.join(self.publisher.model.projectpath,tplpath,theme,"filter.xsl")

        # copy the template into the publication space
        # shutil.copy(tfile, dfile)

        # uncompress the template
        tz = self.publisher.model.get_zip_object()
        tz.open(tfile,"r")

        # create the destination zipfile
        dz = self.publisher.model.get_zip_object()
        dz.open(dfile,"w")

        # get the template index of files
        mf=ET.XML(tz.read('META-INF/manifest.xml'))
        # apply the pre cover.xsl to the pivot file to generate the cover file
        piv=self.publisher.document
        #try:
        #    filter=ET.parse(coverfile)
        #    f=ET.XSLT(filter)
        #    piv=f(piv)
        #except:
        #    dbgexc()
        #    yield(self.publisher.view.error(self.publisher.setmessage(u"[0067][Odt][%(theme)s]Erreur lors de la génération de la page de couverture %(label)s", {'theme': theme, 'label': self.label.encode('utf-8')})))

            #debug(f.error_log )

        # apply the pre filter.xsl to the pivot file
        try:
            filter=ET.parse(filterfile)
            f=ET.XSLT(filter)
            piv=f(piv)
        except:
            dbgexc()
            yield(self.publisher.view.error(self.publisher.setmessage(u"[0068][Odt][%(theme)s]Erreur lors du filtrage de %(label)s", {'theme': theme, 'label': self.label.encode('utf-8')})))

            #debug(f.error_log )

        # handle all media
        odtids={}
        iter = 0
        try:
            for img in piv.xpath('/h:html/h:body//h:img', namespaces={'h':'http://www.w3.org/1999/xhtml'}):
                newsrc = self.publisher.model.url2id(img.get('src'))
                if odtids.get(newsrc, '') == '':
                    # get an uuid for the image
                    odtid = getid(iter)+os.path.splitext(newsrc)[1]
                    odtids.update({newsrc: odtid})
                    iter += 1
                    # copy the media in the zip
                    try:
                        imgdata=self.publisher.model.abstractIO.getFile(newsrc)
                        dz.writestr("Pictures/%s"%str(odtid),imgdata)

                        # registers the image in the manifest
                        ment=ET.SubElement(mf,"{%s}file-entry"%MFNS)
                        ment.set("{%s}media-type"%MFNS,"image/png")
                        ment.set("{%s}full-path"%MFNS,"Pictures/%s"%odtid)
                    except:
                        dbgexc()
                        yield(self.publisher.view.error(self.publisher.setmessage(u"[0069][Odt][%(theme)s]Erreur lors de la copie de l'illustration %(media)s dans le fichier odt %(label)s", 
                                                                                    {'theme': theme, 'media': str(img.get('src')), 'label': self.label.encode('utf-8')})))
                else:
                    odtid = odtids.get(newsrc)
                # inserts the uuid in the pivot for futher references from xslt
                img.set('newimgid',odtid)
                try:
                    # sets the size and def of the image in the pivot for xslt processing
                    im = Image.open(StringIO(self.publisher.model.abstractIO.getFile(newsrc)))
                    (w,h)=im.size
                    img.set('orig_width',str(w))
                    img.set('orig_height',str(h))
                    try:
                        (dw,dh)=im.info['dpi']
                        img.set('orig_resw',str(dw))
                        img.set('orig_resh',str(dh))
                    except:
                        pass
                except:
                    pass
        except:
            dbgexc()
            yield(self.publisher.view.error(self.publisher.setmessage(u"[0070][Odt][%(theme)s]Erreur lors de la copie des illustrations dans le fichier odt %(label)s", 
                                                                      {'theme': theme, 'label': self.label.encode('utf-8')})))

        mmt=mf.xpath('/manifest:manifest/manifest:file-entry[@manifest:full-path]', namespaces={'manifest':MFNS})[0]
        mmt.set('{urn:oasis:names:tc:opendocument:xmlns:manifest:1.0}media-type','application/vnd.oasis.opendocument.text')

        # write back the manifest in the produced odt file
        dz.writestr('META-INF/manifest.xml', bytes=ET.tostring(mf))

        # creates a temporary pivot file (should use an xslt extension for that
        fpiv=open("%s_tmp"%pivfile,'w')
        fpiv.write(ET.tostring(piv))
        fpiv.close()

        # creates a temporary styles file from the template, TODO : use an xslt extension
        fstyles=open("%s_tmpstyles"%pivfile,'w')
        fstyles.write(tz.read('styles.xml'))
        fstyles.close()

        # generates the metadata of the odt file

        tmeta=ET.XML(tz.read('meta.xml'))
        try:
            xslx=ET.parse(os.path.join(self.plugindir,'xsl','generate-meta.xsl'))
            xslt=ET.XSLT(xslx)
            doc=xslt(tmeta,
                     pivot="'%s'"%urllib.quote("%s_tmp"%pivfile))
        except:
            dbgexc()
            yield(self.publisher.view.error(self.publisher.setmessage(u"[0071][Odt][%(theme)s]Erreur lors de la copie des métadonnées de %(label)s", 
                                                                      {'theme': theme, 'label': self.label.encode('utf-8')})))


        #logfile=open(os.path.join(pubpath,"meta.xml"),'w')
        #logfile.write(ET.tostring(doc,pretty_print=True))
        #logfile.close()
        #writeback metadata in the generated file
        dz.writestr('meta.xml', bytes=str(doc))


        # generates the content

        template=ET.XML(tz.read('content.xml'))

        xslx=ET.parse(os.path.join(self.plugindir,'xsl','generate.xsl'))
        xslt=ET.XSLT(xslx)
        try:
            print urllib.quote(pivfile)
            print mapfile
            doc=xslt(template,
                     pivot="'%s_tmp'"%urllib.quote(pivfile),
                     styles="'%s_tmpstyles'"%urllib.quote(pivfile),
                     mapping="'%s'"%urllib.quote(mapfile))
        except:
            dbgexc()
            yield(self.publisher.view.error(self.publisher.setmessage(u"[0072][Odt][%(theme)s]Erreur lors de la génération du contenu de l'odt %(label)s", 
                                                                      {'theme': theme, 'label': self.label.encode('utf-8')})))


        #logfile=open(os.path.join(pubpath,"content.xml"),'w')
        #logfile.write(ET.tostring(doc,pretty_print=True))
        #logfile.close()

        dz.writestr('content.xml', bytes=str(doc))
        dz.writestr('mimetype', bytes='application/vnd.oasis.opendocument.text')

        # Copy all unhandled files from template to generated doc

        for f in tz.namelist():
            if not dz.namelist().__contains__(f):
                dz.writestr(f, bytes=tz.read(f))

        tz.close()
        dz.close()

        odtfilename = "%s%s" %(self.publisher.profilename, self.suffix)

        # save the generated zip (odt)
        self.publisher.model.putdata(u"%s/%s.odt"%(self.publisher.model.pubdir,odtfilename), dfile.getvalue())

        #removes temporary files
        os.remove("%s_tmp"%pivfile)
        os.remove("%s_tmpstyles"%pivfile)

        # output file name
        yield(self.publisher.view.publink('ODT', self.label, '%s/%s.odt' %(self.publisher.model.local2url(self.publisher.model.pubpath), odtfilename)))

        #try to generate pdf if asked

        if self.params.has_key('pdf') and self.params['pdf']=='1':
            try:
                epdf=odtpdf.KolektiODTPDF(self.publisher, self.conf)
                # creates a temporary pdf
                odtlocalname = self.publisher.model.abstractIO.unicode2local(u"%s.odt" % odtfilename)
                pdffile = self.publisher.model.abstractIO.unicode2local("%s_tmp.pdf" % odtfilename)
                pdfproperties = os.path.join(self.publisher.model.projectpath,tplpath,theme,"pdf_properties.xml")
                odtpath = os.path.join(self.publisher.model.pubpath, odtlocalname)
                epdf.exportDoc(odtpath,pdffile,pdfproperties)
                pdffd=open(os.path.join(pubpath,pdffile))
                self.publisher.model.putdata("%s/%s.pdf"%(self.publisher.model.pubdir,odtfilename),pdffd.read())
                pdffd.close()
                yield(self.publisher.view.publink('PDF', self.label, '%s/%s.pdf' %(self.publisher.model.local2url(self.publisher.model.pubpath), odtfilename)))
            except:
                dbgexc()
                yield(self.publisher.view.error(self.publisher.setmessage(u"[0073][Odt][%(theme)s]Erreur lors de la génération du fichier pdf %(label)s", {'theme': theme, 'label': odtfilename.encode('utf-8')})))
