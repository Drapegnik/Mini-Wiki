import collections

from app.models import *
from courseproject.models import *

categories = ["Programming", "Biology", "Chemistry", "History", "Physics"]

themes = {"Light": "https://bootswatch.com/flatly/bootstrap.min.css",
          "Dark": "https://bootswatch.com/darkly/bootstrap.min.css"}

languages = {"English": "en-us", "Russian": "ru"}

templates = [{"Template1": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455957202/Template1.png"},
             {"Template2": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455957313/Template2.png"},
             {"Template3": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455956561/Template3.png"}]

achievements = {"hundred": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455719879/badge_l_dhjrve.png",
                            "get karma score 100."],
                "social": [
                    "http://res.cloudinary.com/ddde4c88o/image/upload/v1455719879/social-networking-business_bgyqeg.png",
                    "connect all social networks."],
                "gagarin": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455817302/gagarin.jpg",
                             "take a space under post first."],
                "like_youself": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455816559/slon.png",
                             "be like elephant."],
                "critic": ["http://res.cloudinary.com/ddde4c88o/image/upload/v1455730810/1422_vproiu.jpg",
                           "left 10 comments."]}

for category in categories:
    Category.objects.create(name=category)

for name, css_link in themes.items():
    Theme.objects.create(name=name, css_link=css_link)

for lang, code in languages.items():
    Language.objects.create(name=lang, code=code)

for template in templates:
    Template.objects.create(name=list(template.keys())[0], preview_link=list(template.values())[0])

for name, data in achievements.items():
    Achievement.objects.create(name=name, picture=data[0], description=data[1])


