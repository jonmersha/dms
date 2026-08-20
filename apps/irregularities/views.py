from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import IrregularityReport, IncidentCategory, IncidentSystem, ResponsibleOrgan, OrganizationalUnit
from .serializers import (
    IrregularityReportSerializer,
    IncidentCategorySerializer,
    IncidentSystemSerializer,
    ResponsibleOrganSerializer,
    OrganizationalUnitSerializer,
    ResidentAuditFindingSerializer,
    FindingEvidenceSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ResidentAuditFinding, FindingEvidence, FindingAuditTrail

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

class OrganizationalUnitViewSet(viewsets.ModelViewSet):
    queryset = OrganizationalUnit.objects.select_related('parent').all()
    serializer_class = OrganizationalUnitSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class IrregularityReportViewSet(viewsets.ModelViewSet):
    queryset = IrregularityReport.objects.select_related('branch', 'reported_by', 'category', 'involved_system', 'responsible_organ').all().order_by('-created_at')
    serializer_class = IrregularityReportSerializer
    permission_classes = [IsAuthenticated]

class ResidentAuditFindingViewSet(viewsets.ModelViewSet):
    queryset = ResidentAuditFinding.objects.select_related('branch', 'auditor', 'responsible_officer').prefetch_related('evidences', 'audit_trail').all().order_by('-created_at')
    serializer_class = ResidentAuditFindingSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        finding = self.get_object()
        new_status = request.data.get('status')
        management_response = request.data.get('management_response')
        
        if not new_status:
            return Response({"error": "status is required"}, status=400)
            
        old_status_display = finding.get_status_display()
        finding.status = new_status
        if management_response:
            finding.management_response = management_response
            
        finding.save()
        
        FindingAuditTrail.objects.create(
            finding=finding,
            user=request.user,
            action=f"Status changed from {old_status_display} to {finding.get_status_display()}"
        )
        
        serializer = self.get_serializer(finding)
        return Response(serializer.data)

class FindingEvidenceViewSet(viewsets.ModelViewSet):
    queryset = FindingEvidence.objects.all().order_by('-uploaded_at')
    serializer_class = FindingEvidenceSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
