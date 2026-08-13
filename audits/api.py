from rest_framework import viewsets, permissions, serializers
from .models import AuditPeriod

class AuditPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditPeriod
        fields = '__all__'

class AuditPeriodViewSet(viewsets.ModelViewSet):
    queryset = AuditPeriod.objects.all().order_by('-fiscal_year')
    serializer_class = AuditPeriodSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
