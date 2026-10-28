from rest_framework import renderers

class UserRenderer(renderers.JSONRenderer):
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        # DRF's renderer handles dates, datetimes, Decimals, and other values
        # returned by serializers. Plain json.dumps() cannot serialize date objects.
        return super().render(data, accepted_media_type, renderer_context)
