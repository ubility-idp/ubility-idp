
from celery.contrib.abortable import AbortableTask

from app import app


class CeleryTask(AbortableTask):

    def __call__(self, *args, **kwargs):
        with app.app_context():
            return AbortableTask.__call__(self, *args, **kwargs)
