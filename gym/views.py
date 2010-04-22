from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.utils import simplejson

@login_required
def index( request ):
    return render_to_response(
        "index.html", {}, context_instance = RequestContext( request )
    )

def login_user( request ):
    return render_to_response(
        "login.html", {}, context_instance = RequestContext( request )
    )

@login_required
def logout_user( request ):
    logout( request )
    return redirect( "/" )

def ext_login( request ):
    json = {
        'message': '',
        'success': False
    }
    user = authenticate( username=request.POST['username'], password=request.POST['password'] )
    if user is not None:
        if user.is_active:
            login( request, user )
            json['success'] = True
        else:
            json['message'] = 'Account disabled contact with <a href="mailto:root@seiho.pl">admin</a> !'
    else:
        json['message'] = 'Username and/or password invalid'

    return HttpResponse( simplejson.dumps( json, cls=DjangoJSONEncoder ) )
