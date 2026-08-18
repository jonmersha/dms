from rest_framework import serializers
from .models import ContentBlock

class ContentBlockSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ContentBlock
        fields = ['id', 'page', 'section_key', 'content', 'updated_at', 'updated_by_name']
        read_only_fields = ['id', 'updated_at', 'updated_by_name']

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return obj.updated_by.get_full_name() or obj.updated_by.username
        return None

class BulkContentBlockUpdateSerializer(serializers.Serializer):
    blocks = ContentBlockSerializer(many=True)

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass
