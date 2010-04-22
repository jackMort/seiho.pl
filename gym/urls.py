import os
from django.conf.urls.defaults import *
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    (r'^admin/', include(admin.site.urls)),
    
    url(r'^media/(.*)$', 'django.views.static.serve', { 'document_root' : os.path.join( os.path.dirname( __file__ ), 'media' ) } ),
    url(r'^/?$', 'django.views.generic.simple.direct_to_template', { 'template' : 'index.html' }, name='index' ),

    url(r'^exercises$', 'gym.exercises.views.index' ),
    
    # login logout ...                       
    url(r'^login$', 'gym.views.login' ),
    url(r'^json/login$', 'gym.views.ext_login' )
)
