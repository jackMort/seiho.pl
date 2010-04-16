# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User

class Type( models.Model ):
    name = models.CharField( max_length=100 )
    description = models.TextField()

    def __str__( self ):
        return self.name

class ExerciseDefinition( models.Model ):
    type = models.ForeignKey( Type )
    name = models.CharField( max_length=100 )
    description = models.TextField()

    def __str__( self ):
        return self.name

class Serie( models.Model ):
    number = models.IntegerField()
    reps = models.IntegerField()
    mass = models.FloatField()

    def __str__( self ):
        return "%d, %d, %f" % ( self.number, self.reps, self.mass )

class Exercise( models.Model ):
    exercise = models.ForeignKey( ExerciseDefinition )
    series = models.ManyToManyField( Serie )
    day = models.IntegerField()

    def __str__( self ):
        return "%d" % ( self.day )

class Session( models.Model ):
    name = models.CharField( max_length=100 )
    user = models.ForeignKey( User )
    description = models.TextField()
    exercise = models.ManyToManyField( Exercise )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    class Admin:
        list_display = ( 'name', 'start_date', 'end_date', 'user' )
        search_fields = ( 'name', 'start_date', 'end_date', 'user' )

    class Meta:
        ordering = ( '-start_date', )

