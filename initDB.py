from courseproject.models import *
import collections

categories = ["Programming", "Biology", "Chemistry", "History", "Physics"]

themes = {"Light": "https://bootswatch.com/flatly/bootstrap.min.css",
          "Dark": "https://bootswatch.com/darkly/bootstrap.min.css"}

languages = {"English": "en-us", "Russian": "ru"}

templates = {"Template1": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455457177/Template1.png",
             "Template2": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455457214/Template2.png",
             "Template3": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455105501/template3.png"}

templates = collections.OrderedDict(templates)

for category in categories:
    Category.objects.create(name=category)

for name, css_link in themes.items():
    Theme.objects.create(name=name, css_link=css_link)

for lang, code in languages.items():
    Language.objects.create(name=lang, code=code)

for name, preview_link in templates.items():
    Template.objects.create(name=name, preview_link=preview_link)

