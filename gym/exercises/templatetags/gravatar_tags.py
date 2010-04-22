import urllib, hashlib
from django import template

register = template.Library()
@register.simple_tag
def gravatar_url( email, size = 40, default = "null" ):
	gravatar_url = "http://www.gravatar.com/avatar.php?"
	gravatar_url += urllib.urlencode(
			{
				'gravatar_id': hashlib.md5( email ).hexdigest(),
				'default'    : default,
				'size'       : str( size )
			}
	)
	return gravatar_url
