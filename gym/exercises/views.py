from gym.providers import remote_provider
from gym.exercises.models import Exercise
from extdirect.django import remoting, ExtDirectStore

@remoting( remote_provider, action='exercises', len=1 )
def list( request ):
    extra = [
        ( 'date', lambda obj: obj.training.all()[0].date ),
        ( 'template_name', lambda obj: obj.template.name ),
        ( 'template_type', lambda obj: obj.template.type.name ),
    ]
    
    exercises = ExtDirectStore( Exercise, extra )
    extdirect_data = request.extdirect_post_data[0]

    extdirect_data['training__user__id'] = request.user.id
    
    return exercises.query( **extdirect_data )
