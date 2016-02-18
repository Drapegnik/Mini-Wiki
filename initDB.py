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

achievements = {"hundred": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455719879/badge_l_dhjrve.png",
                "social": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455719879/social-networking-business_bgyqeg.png",
                "firstNah": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455719878/images_xhcnec.jpg",
                "selfLike": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455720935/sam-sebe-postavil-layk_37517028_orig__mqvkmq.jpg",
                "critic": "http://res.cloudinary.com/ddde4c88o/image/upload/v1455730810/1422_vproiu.jpg"}

templates = collections.OrderedDict(templates)

for category in categories:
    Category.objects.create(name=category)

for name, css_link in themes.items():
    Theme.objects.create(name=name, css_link=css_link)

for lang, code in languages.items():
    Language.objects.create(name=lang, code=code)

for name, preview_link in templates.items():
    Template.objects.create(name=name, preview_link=preview_link)

for name, link in achievements.items():
    Achievement.objects.create(name=name, picture=link)


