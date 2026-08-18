from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import IrregularityReport, IncidentCategory, IncidentSystem, ResponsibleOrgan
from .serializers import (
    IrregularityReportSerializer,
    IncidentCategorySerializer,
    IncidentSystemSerializer,
    ResponsibleOrganSerializer
)

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.is_superuser or request.user.role == 'ADMIN'

class IncidentCategoryViewSet(viewsets.ModelViewSet):
    queryset = IncidentCategory.objects.all().order_by('name')
    serializer_class = IncidentCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class IncidentSystemViewSet(viewsets.ModelViewSet):
    queryset = IncidentSystem.objects.all().order_by('name')
    serializer_class = IncidentSystemSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class ResponsibleOrganViewSet(viewsets.ModelViewSet):
    queryset = ResponsibleOrgan.objects.all().order_by('name')
    serializer_class = ResponsibleOrganSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class IrregularityReportViewSet(viewsets.ModelViewSet):
    queryset = IrregularityReport.objects.select_related('branch', 'reported_by', 'category', 'involved_system', 'responsible_organ').all().order_by('-created_at')
    serializer_class = IrregularityReportSerializer
    permission_classes = [IsAuthenticated]
