from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import DataSource, AuditScript, ScriptExecution, AnalyticsException
from .serializers import (
    DataSourceSerializer,
    AuditScriptSerializer,
    ScriptExecutionSerializer,
    AnalyticsExceptionSerializer,
)

class DataSourceViewSet(viewsets.ModelViewSet):
    queryset = DataSource.objects.all().order_by('-created_at')
    serializer_class = DataSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

class AuditScriptViewSet(viewsets.ModelViewSet):
    queryset = AuditScript.objects.all().order_by('-created_at')
    serializer_class = AuditScriptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        script = self.get_object()
        
        # Create an execution record
        execution = ScriptExecution.objects.create(
            script=script,
            executed_by=request.user,
            status='RUNNING'
        )

        # MOCK EXECUTION LOGIC FOR NOW
        # In a production environment, this would spawn a Celery task to connect to the 
        # external database, execute the SQL, and store the results.
        
        # Simulate found exceptions
        mock_data = [
            {"invoice_number": "INV-2023-001", "amount": 5000.0, "issue": "Duplicate Invoice ID"},
            {"invoice_number": "INV-2023-005", "amount": 12000.0, "issue": "Out of sequence"}
        ]
        
        for data in mock_data:
            AnalyticsException.objects.create(
                execution=execution,
                exception_data=data
            )
            
        execution.status = 'SUCCESS'
        execution.records_processed = 1500  # mock total rows processed
        execution.end_time = timezone.now()
        execution.save()

        return Response({
            "message": "Script executed successfully.",
            "execution_id": execution.id,
            "exceptions_found": len(mock_data)
        }, status=status.HTTP_200_OK)

class ScriptExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScriptExecution.objects.all().order_by('-start_time')
    serializer_class = ScriptExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['script', 'status']

class AnalyticsExceptionViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsException.objects.all().order_by('-created_at')
    serializer_class = AnalyticsExceptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['execution', 'status']
