# Mini-Wiki
A web application that allows to create articles with images, youtube and google maps attachment, rate posts, leave comments and other

<img src="http://res.cloudinary.com/dzsjwgjii/image/upload/v1460745554/mini-wiki.png"/>

**install**:  
```
$ npm install -g bower
$ pip install -r requirements.txt
$ python manage.py bower install
$ python manage.py rebuild_index
$ python manage.py collectstatic
$ python manage.py migrate --run-syncdb
```


**run**:  ```$ python manage.py runserver```

* server: [Python 3](https://www.python.org/download/releases/3.0/) & [Django 1.9](https://www.djangoproject.com/)
* client: [AngularJS v1.4.9](https://angularjs.org/) & [Bootstrap v3.3.5](http://getbootstrap.com/)
* database: [PostgreSQL 9.5](http://www.postgresql.org/) / [MySQL 5.7.10](https://www.mysql.com/)
* globalsearch: [Haystack 2.5.dev0](http://haystacksearch.org/) & [Whoosh 2.7.2](https://pypi.python.org/pypi/Whoosh/)
* editor: [CKEditor](http://ckeditor.com/)
* host: [Heroku](http://heroku.com)
* cloud: [Cloudinary](https://cloudinary.com)

<img src="http://res.cloudinary.com/dzsjwgjii/image/upload/v1461005731/wiki-mobile.png" width=400px/>
<img src="http://res.cloudinary.com/dzsjwgjii/image/upload/v1461005767/wiki-pc.png" width=400px/>
