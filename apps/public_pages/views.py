from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ContentBlock
from .serializers import ContentBlockSerializer, BulkContentBlockUpdateSerializer

class IsContentManager(permissions.BasePermission):
    """
    Custom permission to only allow content managers or superusers to edit.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
            
        allowed_roles = ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER']
        
        return (
            request.user.is_superuser or 
            getattr(request.user, 'can_manage_public_content', False) or 
            getattr(request.user, 'is_staff', False) or
            (hasattr(request.user, 'role') and request.user.role in allowed_roles)
        )

class ContentBlockViewSet(viewsets.ModelViewSet):
    queryset = ContentBlock.objects.all()
    serializer_class = ContentBlockSerializer
    permission_classes = [IsContentManager]

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Expects a list of blocks: [{'page': '...', 'section_key': '...', 'content': '...'}, ...]
        """
        blocks_data = request.data.get('blocks', [])
        if not isinstance(blocks_data, list):
            return Response({'error': 'Expected a list of blocks'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_blocks = []
        for block_data in blocks_data:
            page = block_data.get('page')
            section_key = block_data.get('section_key')
            content = block_data.get('content', '')
            
            if not page or not section_key:
                continue
                
            block, created = ContentBlock.objects.update_or_create(
                page=page,
                section_key=section_key,
                defaults={
                    'content': content,
                    'updated_by': request.user
                }
            )
            updated_blocks.append(block)
            
        serializer = self.get_serializer(updated_blocks, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsContentManager()]
