from django.contrib.auth import authenticate, login
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.utils import simplejson

def login( request ):
    return render_to_response(
        "login.html", {}, context_instance = RequestContext( request )
    )

def ext_login( request ):
    json = {
        'message': '',
        'success': False
    }
    user = authenticate( username=request.POST['username'], password=request.POST['password'] )
    if user is not None:
        if user.is_active:
            login( request )
            json['success'] = True
        else:
            json['message'] = 'Account disabled contact with <a href="mailto:root@seiho.pl">admin</a> !'
    else:
        json['message'] = 'Username and/or password invalid'

    return HttpResponse( simplejson.dumps( json, cls=DjangoJSONEncoder ) )
