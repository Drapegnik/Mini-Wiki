from haystack import indexes
from app.models import Publication, Comment


class PublicationIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    header = indexes.CharField(model_attr='header')
    description = indexes.CharField(model_attr='description')
    body = indexes.CharField(model_attr='body')

    def get_model(self):
        return Publication


class CommentIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)

    def get_model(self):
        return Comment
