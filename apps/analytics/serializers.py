from rest_framework import serializers
from .models import DataSource, AuditScript, ScriptExecution, AnalyticsException

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'
        extra_kwargs = {'connection_string': {'write_only': True}} # Never expose connection string

class AuditScriptSerializer(serializers.ModelSerializer):
    target_data_source_name = serializers.CharField(source='target_data_source.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = AuditScript
        fields = '__all__'

class ScriptExecutionSerializer(serializers.ModelSerializer):
    script_name = serializers.CharField(source='script.name', read_only=True)
    executed_by_name = serializers.CharField(source='executed_by.get_full_name', read_only=True)

    class Meta:
        model = ScriptExecution
        fields = '__all__'

class AnalyticsExceptionSerializer(serializers.ModelSerializer):
    script_name = serializers.CharField(source='execution.script.name', read_only=True)

    class Meta:
        model = AnalyticsException
        fields = '__all__'
