# -*- coding: utf-8 -*-
#
#     kOLEKTi : a structural documentation generator
#     Copyright (C) 2007-2010 Stéphane Bonhomme (stephane@exselt.com)
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




""" Main class for translations
"""

__author__  = '''Stéphane Bonhomme <stephane@exselt.com>'''

import gettext

from kolekti.kolekticonf import conf

# Class for translatable texts
class tr(object):
    '''holds a text with a format string, and associated parameters'''
    def __init__(self, u, fmtdic={}, **kwargs):
        assert isinstance(u,unicode)
        self.__u=u
        self.__fmtdic=fmtdic
        for (n,v) in kwargs.iteritems():
            self.__fmtdic.update({n:v})

    def __repr__(self):
        return self.__u%self.__fmtdic


    def i18n(self, translations):
        if conf.get('debug_locale'):
            r = self.__u%self.__fmtdic
        else:
            r = translations.ugettext(self.__u)%self.__fmtdic
        if isinstance(r,unicode):
            return r
        else:
            return r.decode('utf-8')