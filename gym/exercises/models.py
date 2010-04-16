# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User

class Type( models.Model ):
    name = models.CharField( max_length=100 )
    description = models.TextField()

class Exercise( models.Model ):
    type = models.ForeignKey( Type )
    name = models.CharField( max_length=100 )
    description = models.TextField()

class Serie( models.Model ):
    reps = models.IntegerField()
    mass = models.FloatField()

class UserExercise( models.Model ):
    user = models.ForeignKey( User )
    exercise = models.ForeignKey( Exercise )
    series = models.ManyToManyField( Serie )
    day = models.IntegerField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
