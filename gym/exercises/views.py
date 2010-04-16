from gym.exercises.models import Exercise
from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404

def index( request ):
	exercises = Exercise.objects.all()
	
	return render_to_response(
		"exercises/list.html", { "exercises": exercises }, context_instance = RequestContext( request )
	)
