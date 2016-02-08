# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-02-08 13:48
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('courseproject', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('username', models.CharField(max_length=254, unique=True)),
                ('email', models.EmailField(blank=True, max_length=254, unique=True)),
                ('location', models.CharField(blank=True, max_length=140)),
                ('gender', models.CharField(blank=True, max_length=140)),
                ('about', models.CharField(blank=True, max_length=500)),
                ('photo', models.URLField(blank=True)),
                ('is_admin', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(blank=True, default=django.utils.timezone.now, editable=False)),
                ('updated_at', models.DateTimeField(blank=True, default=django.utils.timezone.now, editable=False)),
                ('language', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='courseproject.Language')),
                ('theme', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='courseproject.Theme')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]