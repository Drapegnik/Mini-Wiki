from app.models import Category, Theme, Language

categories = ["Programming", "Biology", "Chemistry", "History", "Physics"]

themes = {"Light": "https://bootswatch.com/flatly/bootstrap.min.css",
          "Dark": "https://bootswatch.com/darkly/bootstrap.min.css"}

languages = ["English", "Russian"]

for lang in languages:
    Language.objects.create(name=lang)

for category in categories:
    Category.objects.create(name=category)

for name, cssLink in themes.items():
    Theme.objects.create(name=name, cssLink=cssLink)
