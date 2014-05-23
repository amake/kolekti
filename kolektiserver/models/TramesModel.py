# -*- coding: utf-8 -*-
#
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




""" Trames model class """

__author__  = '''Guillaume Faucheur <guillaume@exselt.com>'''

import re
import urllib2
import os

from lxml import etree as ET

from kolekti.exceptions import exceptions as EXC
from kolekti.logger import debug, dbgexc
from kolekti.utils.i18n.i18n import tr

from kolektiserver.models.ProjectModel import ProjectModel
#from kolektiserver.models.sql.models import Usecase

class TramesModel(ProjectModel):
    __localNS={"kolekti:trames":"kt",
               "kolekti:browser":"ka",
               "kolekti:usersession":"ku",
               "kolekti:viewer":"kv"}
    _KEEPMETA=False

    def __init__(self, *args,**kwargs):
        ''' Init namespaces '''
        try:
            kwargs['ns'].update(self.__localNS)
        except KeyError:
            kwargs['ns']=self.__localNS
        super(TramesModel,self).__init__(*args,**kwargs)

    def delete(self, id):
        ''' Override default delete method '''
        super(TramesModel,self).delete(id)
        # Remove in DB usecase
        sql = self.http.dbbackend
        Usecase = sql.get_model('Usecase')
        norm_id=self.abstractIO.normalize_id(id)
        res = sql.select(Usecase, "resid='%s'" %norm_id)
        sql.delete(res)

    def put(self, id):
        ''' Override default put method '''
        # Save trame
        data = self.http.body
        if data is None:
            data=""
        try:
            # format trame
            xml = ET.XML(data)
            data = ET.tostring(xml, pretty_print=True)
        except:
            pass
        # logmsg is an unicode
        try:
            logmsg=unicode(self.http.headers.get('KOLEKTICOMMIMSG','').decode('utf-8',"replace"))
        except:
            logmsg=u""
        print "put trame with log", logmsg
        try:
            self.abstractIO.putFile(id, data, logmsg)
        except:
            dbgexc()
            raise EXC.FailedDependency

        # Get data of new trame
        norm_id=self.abstractIO.normalize_id(id)

        sql = self.http.dbbackend
        Usecase = sql.get_model('Usecase')
        res = sql.select(Usecase, "resid='%s'" %norm_id)
        sql.delete(res)
        
        # Save usage for each module on trame
        listmod = self.__getModules(ET.XML(data))
        for mod in listmod:
            sql.insert(Usecase(self.project.get('id'),norm_id,self.abstractIO.normalize_id(mod)))
        #super(TramesModel, self).log_save(id)

    def __getModules(self, xml):
        return [unicode(mod.get('resid')) for mod in xml.xpath('/kt:trame/kt:body//kt:module', namespaces={"kt":"kolekti:trames"})]

    def __is_root_trames(self, id):
        r=self.abstractIO.normalize_id(id)
        splitId = r.split('/')
        return len(splitId) == 4

    _history_filter=lambda self,p: (not p.split('/')[-1][0]=='_') and (os.path.splitext(p)[1]=='.xml')


    ###############################################
    # DAV Methods
    ###############################################

    def _prop_dav_displayname(self, resid):
        #Example collection
        p = self._xmlprop('displayname')
        #p.text = uri.objname
        if self.__is_root_trames(resid):
            s = tr(u"[0029]Trames")
            p.text = s.i18n(self.http.translation)
        else:
            name = resid.split('/')[-1]
            p.text=name.rsplit('.',1)[0]
        return p

    # Browser
    def _prop_ka_mainbrowseractions(self, resid):
        ''' Define main actions of browser '''
        p = self._xmlprop('mainbrowseractions','kolekti:browser')
        ET.SubElement(p, '{kolekti:browser}action', attrib={'id':'newtrame'})
        return p

    def _prop_ka_browseractions(self, resid):
        ''' Define action for each item of browser '''
        p = self._xmlprop('browseractions','kolekti:browser')
        if not self.__is_root_trames(resid):
            ET.SubElement(p, '{kolekti:browser}action', attrib={'id':'delete'})
        if self.isCollection(resid):
            ET.SubElement(p, '{kolekti:browser}action', attrib={'id':'newtramedir'})
        return p

    def _prop_ka_browserbehavior(self, resid):
        ''' Event to notify for each item of browser '''
        p = self._xmlprop('browserbehavior','kolekti:browser')
        if self.isResource(resid):
            if self.http.headers.get('Kolektibrowser', '') == 'selecttrame':
                ET.SubElement(p, '{kolekti:browser}behavior', attrib={'id':'selectfile'})
            else:
                ET.SubElement(p, '{kolekti:browser}behavior', attrib={'id':'displaymodule'})
                ET.SubElement(p, '{kolekti:browser}behavior', attrib={'id':'displaytrame'})
        if self.isCollection(resid) and self.http.headers.get('Kolektibrowser', '') == 'newtrame':
            ET.SubElement(p, '{kolekti:browser}behavior', attrib={'id':'selectdir'})
        return p

    def _prop_ka_browsericon(self, resid):
        ''' Change icon of browser items '''
        p = self._xmlprop('browsericon','kolekti:browser')
        return p

    # Viewer
    def _prop_kv_views(self, resid):
        ''' Define viewers '''
        p = self._xmlprop('views', 'kolekti:viewer')
        ET.SubElement(p, '{kolekti:viewer}view', attrib={'id':'trameeditor'})
        return p

    def _prop_kv_vieweractions(self, resid):
        ''' Define actions of viewers '''
        p = self._xmlprop('vieweractions', 'kolekti:viewer')
        ET.SubElement(p, '{kolekti:viewer}action', attrib={'id':'view'})
        ET.SubElement(p, '{kolekti:viewer}action', attrib={'id':'publishtrame'})
        return p

    def _prop_kv_clientactions(self, resid):
        ''' Define actions of viewers '''
        p = self._xmlprop('clientactions', 'kolekti:viewer')
        ET.SubElement(p, '{kolekti:viewer}action', attrib={'id':'trame_add_section'})
        ET.SubElement(p, '{kolekti:viewer}action', attrib={'id':'trame_add_tdm'})
        ET.SubElement(p, '{kolekti:viewer}action', attrib={'id':'trame_add_index'})
        ET.SubElement(p, '{kolekti:viewer}action', attrib={'id':'trame_add_revnotes'})
        return p

    # Trames
    def _prop_kt_heading(self, resid):
        ''' Get trame heading sidebar view '''
        p = self._xmlprop('heading','kolekti:trames')
        return p

    def _prop_kt_usage(self, resid):
        ''' Get orders trame usage '''
        p = self._xmlprop('usage','kolekti:trames')
        splitTrame = resid.split('trames/')
        sql = self.http.dbbackend
        Usecase = sql.get_model('Usecase')
        trresid=self.abstractIO.normalize_id(resid)
        res = sql.select(Usecase, "ref='%s'" %(trresid,))
        for r in res:
            oresid = r.resid
            print "-->",oresid,
            if oresid[len(self.abstractIO.uprojectpart)+1:].startswith('/configuration/orders'):
                ourl = self.id2url(oresid)
                e = ET.SubElement(p, "{kolekti:trames}order", {'resid': oresid, 'url': ourl, 'urlid': self._urihash(ourl)})
                configModel=self._loadMVCobject_('ConfigurationModel')
                e.text = configModel._prop_dav_displayname(oresid).text
        return p

    def _prop_kt_diagnostic(self, resid):
        ''' Get trame diagnostic view '''
        debug("Trame diagnostic")
        p = self._xmlprop('diagnostic','kolekti:trames')
        trame = ET.XML(self.abstractIO.getFile(resid))
        listmod = {}
        for mod in trame.xpath('/kt:trame/kt:body//kt:module', namespaces={'kt':'kolekti:trames'}):
            resid = unicode(mod.get('resid'))
            if listmod.has_key(resid):
                continue
            listmod.update({resid: "1"});
            debug("checking %s" %resid)
            if self.abstractIO.exists(resid) or resid.startswith(u"kolekti://"):
                s = ET.SubElement(p, "success", {"src": resid})
                s.text = resid.split('/')[-1]
                if not resid.startswith(u"kolekti://"):
                    modmodel = self._loadMVCobject_('ModulesModel')
                    if not modmodel.isValid(resid):
                        s = ET.SubElement(p, "error", {"src": resid, "type": "invalid"})
                        s.text = resid.split('/')[-1]
            else:
                s = ET.SubElement(p, "error", {"src": resid})
                s.text = resid.split('/')[-1]
        return p

    def _prop_kt_notes(self, resid):
        ''' Get trame notes view '''
        p = self._xmlprop('notes','kolekti:trames')
        versioninfo=self.abstractIO.svnlog(resid,limit=1)[0]
        p.text=versioninfo.get('msg')
        return p
