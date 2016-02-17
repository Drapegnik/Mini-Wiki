from haystack import indexes
from app.models import Publication


class PubliationIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    author = indexes.CharField(model_attr='author')
    category = indexes.CharField(model_attr='category')

    def get_model(self):
        return Publication
