from django.db import models


class Theme(models.Model):
    name = models.CharField(max_length=150, unique=True)
    css_link = models.URLField()

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name


class Template(models.Model):
    name = models.CharField(max_length=150, unique=True)
    preview_link = models.URLField()

    def __str__(self):
        return self.name
