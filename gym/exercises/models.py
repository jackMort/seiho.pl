# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User

class Type( models.Model ):
    parent = models.ForeignKey( 'self', blank=True, null=True )
    name = models.CharField( max_length=100 )
    description = models.TextField()

    def __str__( self ):
        return self.name

class Muscle( models.Model ):
    name = models.CharField( max_length=100 )
    description = models.TextField()

    def __str__( self ):
        return self.name

class ExerciseTemplate( models.Model ):
    type = models.ForeignKey( Type )
    muscles = models.ManyToManyField( Muscle, blank=True, null=True )
    name = models.CharField( max_length=100 )
    description = models.TextField()

    def __str__( self ):
        return self.name

class Set( models.Model ):
    number = models.IntegerField()
    reps = models.IntegerField( null=True )
    mass = models.FloatField( null=True )
    distance = models.FloatField( null=True )
    time = models.TimeField( null=True )

class Exercise( models.Model ):
    template = models.ForeignKey( ExerciseTemplate )
    sets = models.ManyToManyField( Set )

class Training( models.Model ):
    user = models.ForeignKey( User )
    date = models.DateTimeField()
    description = models.TextField()
    exercises = models.ManyToManyField( Exercise )
