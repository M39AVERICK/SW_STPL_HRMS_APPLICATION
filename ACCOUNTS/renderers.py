from rest_framework import renderers
import json

class UserRenderer(renderers.JSONRenderer):
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        
        if isinstance(data, dict):
            if 'errors' in data:
                return json.dumps({'errors': data['errors']})
            
            # ✅ keep full data (including token)
            return json.dumps(data)

        return json.dumps(data)