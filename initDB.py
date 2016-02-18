import collections

from app.models import *
from courseproject.models import *

categories = ["Programming", "Biology", "Chemistry", "History", "Physics"]

themes = {"Light": "https://bootswatch.com/flatly/bootstrap.min.css",
          "Dark": "https://bootswatch.com/darkly/bootstrap.min.css"}

languages = {"English": "en-us", "Russian": "ru"}

templates = {"Template1": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455457177/Template1.png",
             "Template2": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455457214/Template2.png",
             "Template3": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455105501/template3.png"}

achievements = {"hundred": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455719879/badge_l_dhjrve.png",
                            "get karma score 100."],
                "social": [
                    "http://res.cloudinary.com/ddde4c88o/image/upload/v1455719879/social-networking-business_bgyqeg.png",
                    "integrate your account with all social networks."],
                "firstNah": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455817302/gagarin.jpg",
                             "left a first comment under publication."],
                "selfLike": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455816559/slon.png",
                             "like youself. you are so cool."],
                "critic": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455730810/1422_vproiu.jpg",
                           "left a first comment under publication."]}

templates = collections.OrderedDict(templates)

for category in categories:
    Category.objects.create(name=category)

for name, css_link in themes.items():
    Theme.objects.create(name=name, css_link=css_link)

for lang, code in languages.items():
    Language.objects.create(name=lang, code=code)

for name, preview_link in templates.items():
    Template.objects.create(name=name, preview_link=preview_link)

for name, data in achievements.items():
    Achievement.objects.create(name=name, picture=data[0], description=data[1])


