from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.utils import simplejson
from django.contrib.auth import authenticate, login

def ext_login( request ):
    json = {
        'errors': {},
        'text': {},
        'success': False
    }
    user = authenticate( username=request.GET['username'], password=request.GET['password'] )
    if user is not None:
        if user.is_active:
            login( request, user )
            json['success'] = True
        else:
            json['errors']['username'] = 'Account disabled'
    else:
        json['errors']['username'] = 'Username and/or password invalid'

    return HttpResponse( simplejson.dumps( json, cls=DjangoJSONEncoder ) )
