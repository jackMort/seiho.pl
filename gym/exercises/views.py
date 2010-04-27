from gym.providers import remote_provider
from gym.exercises.models import Exercise
from extdirect.django import remoting, ExtDirectStore


@remoting( remote_provider, action='exercises', len=1 )
def list( request ):
    extra = [
        ( 'date', lambda obj: obj.training.date ),
        ( 'template_name', lambda obj: obj.template.name ),
    ]
    
    exercises = ExtDirectStore( Exercise, extra )
    extdirect_data = request.extdirect_post_data[0]
    
    return exercises.query( **extdirect_data )
