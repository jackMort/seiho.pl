from gym.providers import remote_provider
from gym.exercises.models import *
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
    base_info = data['base_info']
    
    treining = Training( user=request.user, date="%s 00:00:00" % base_info['date'], description=base_info['description'] )
    treining.save()

    for ex in data['exercises']:
        template = ExerciseTemplate.objects.get( id=ex['id'] )
        if template is not None:
            exercise = Exercise( template=template )
            exercise.save()

            sr_id = 1;
            for sr in ex['series']:
                if len( sr['reps'] ) == 0:
                    sr['reps'] = None

                if len( sr['mass'] ) == 0:
                    sr['mass'] = None

                if len( sr['distance'] ) == 0:
                    sr['distance'] = None

                if len( sr['time'] ) == 0:
                    sr['time'] = None


                exercise.sets.add( Set.objects.create( number=sr_id, reps=sr['reps'], mass=sr['mass'], distance=sr['distance'], time=sr['time'] ) )
                sr_id =+ 1
            
            treining.exercises.add( exercise )
        
    return dict( success=True, message=message )
