from gym.providers import remote_provider
from gym.exercises.models import Exercise, ExerciseTemplate, Type
from extdirect.django import remoting, ExtDirectStore
from django.core import serializers
from django.utils import simplejson

@remoting( remote_provider, action='exercises', len=1 )
def list( request ):
    extra = [
        ( 'date', lambda obj: obj.training.all()[0].date ),
        ( 'template_name', lambda obj: obj.template.name ),
        ( 'template_type', lambda obj: obj.template.type.name ),
        ( 'sets', lambda obj: serializers.serialize( 'json', obj.sets.all() ) )
    ]
    
    exercises = ExtDirectStore( Exercise, extra )
    extdirect_data = request.extdirect_post_data[0]

    extdirect_data['training__user__id'] = request.user.id
    
    return exercises.query( **extdirect_data )

@remoting( remote_provider, action='templates', len=1 )
def tree( request ):
    result = []
    for t in Type.objects.all():
        children = []
        for e in ExerciseTemplate.objects.filter( type__exact=t ):
            children.append(
                {
                    'id': e.id,
                    'text': e.name,
                    'leaf': True, 'qtip': e.description
                }
            )

        result.append(
            {
                'id': 'c_%d' % t.id,
                'text': t.name,
                'children': children,
                'leaf': len( children ) == 0,
                'expanded': True,
                'draggable': False
            }
        )
    
    return result

@remoting( remote_provider, action='exercises', len=1 )
def save( request ):
    success = False
    message = "" 
    
    data = simplejson.loads( request.extdirect_post_data[0] )

    for exercise in data['exercises']:
        template = ExerciseTemplate.objects.get( id=exercise['id'] )
        if template is not None:
            pass
        #TODO: reszta tego wszystkiego
        
    
    return dict( success=success, message=message )
