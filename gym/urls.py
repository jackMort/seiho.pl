import os, providers
import exercises.views
from django.conf.urls.defaults import *
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns( '',
   url( r'^admin/', include( admin.site.urls ) ),

   url( r'^media/(.*)$', 'django.views.static.serve', { 'document_root' : os.path.join( os.path.dirname( __file__ ), 'media' ) } ),
   url( r'^/?$', 'gym.views.index', name='index' ),

   # ext direct
   url( r'^remoting/router/$', providers.remote_provider.router ),
   url( r'^remoting/api.js$', providers.remote_provider.script ),
    
   # login logout ...                       
   url( r'^accounts/login/$', 'gym.views.login_user', name='login' ),
   url( r'^accounts/logout/$', 'gym.views.logout_user', name='logout' ),
   url( r'^json/login$', 'gym.views.ext_login' )
)
