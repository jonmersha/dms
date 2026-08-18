from django.db import models
from django.conf import settings

class DataSource(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    connection_string = models.CharField(max_length=512, help_text="e.g. postgresql://user:pass@localhost:5432/dbname")
    driver = models.CharField(max_length=50, choices=[
        ('POSTGRES', 'PostgreSQL'),
        ('MYSQL', 'MySQL'),
        ('SQLSERVER', 'SQL Server'),
        ('ORACLE', 'Oracle'),
    ], default='POSTGRES')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class AuditScript(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    target_data_source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name="scripts")
    script_type = models.CharField(max_length=50, choices=[
        ('SQL', 'SQL Query'),
    ], default='SQL')
    code_content = models.TextField(help_text="The actual SQL query to execute")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ScriptExecution(models.Model):
    script = models.ForeignKey(AuditScript, on_delete=models.CASCADE, related_name="executions")
    executed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('RUNNING', 'Running'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ], default='RUNNING')
    records_processed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.script.name} at {self.start_time}"

class AnalyticsException(models.Model):
    execution = models.ForeignKey(ScriptExecution, on_delete=models.CASCADE, related_name="exceptions")
    exception_data = models.JSONField(help_text="The row data that triggered the exception")
    status = models.CharField(max_length=50, choices=[
        ('NEW', 'New'),
        ('REVIEWING', 'Under Review'),
        ('DISMISSED', 'Dismissed / False Positive'),
        ('ESCALATED', 'Escalated to Audit Finding'),
    ], default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Exception for {self.execution.script.name} - #{self.id}"
