from gym.exercises.models import *
from django.contrib import admin

class TypeAdmin( admin.ModelAdmin ):
    pass

class MuscleAdmin( admin.ModelAdmin ):
    pass

class ExerciseTemplateAdmin( admin.ModelAdmin ):
    pass

class TrainingAdmin( admin.ModelAdmin ):
    list_display = ( 'description', 'user', 'date' )
    list_filter = ( 'user', 'date' )

class SetAdmin( admin.ModelAdmin ):
    pass

class ExerciseAdmin( admin.ModelAdmin ):
    pass

admin.site.register( Type, TypeAdmin )
admin.site.register( Muscle, MuscleAdmin )
admin.site.register( ExerciseTemplate, ExerciseTemplateAdmin )
admin.site.register( Training, TrainingAdmin )
admin.site.register( Set, SetAdmin )
admin.site.register( Exercise, ExerciseAdmin )
