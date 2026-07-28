from rest_framework import serializers
from .models import Vendor, Customer, PurchaseOrder, Resource


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['name', 'rate', 'hours']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'

    def create(self, validated_data):
        resources_data = validated_data.pop('resources')
        po = PurchaseOrder.objects.create(**validated_data)

        for r in resources_data:
            Resource.objects.create(po=po, **r)

        return po