from courseproject.settings import *
import dj_database_url

DEBUG = False

DATABASES['default'] = dj_database_url.config()

ALLOWED_HOSTS = (
    'drapegnik-wiki.herokuapp.com',
)
