import re
from rest_framework import serializers

def validate_pan(value):
    if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value):
        raise serializers.ValidationError("Invalid PAN format")
    return value

def validate_aadhar(value):
    if not re.match(r'^\d{12}$', value):
        raise serializers.ValidationError("Aadhar must be 12 digits")
    return value

def validate_ifsc(value):
    if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
        raise serializers.ValidationError("Invalid IFSC")
    return value