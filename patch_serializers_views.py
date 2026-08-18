# 1. Patch serializers.py
with open('apps/lms/serializers.py', 'r') as f:
    serializers_code = f.read()

if 'get_last_position' not in serializers_code:
    old_meta = """    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningEpisode
        fields = ['id', 'title', 'content_type', 'video_url', 'content_text', 'order', 'quiz', 'is_completed', 'playlist']"""
        
    new_meta = """    is_completed = serializers.SerializerMethodField()
    last_position = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningEpisode
        fields = ['id', 'title', 'content_type', 'video_url', 'content_text', 'order', 'quiz', 'is_completed', 'last_position', 'playlist']"""
        
    serializers_code = serializers_code.replace(old_meta, new_meta)
    
    old_completed_method = """    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # We can optimize this later with prefetch_related if needed
            return obj.progress.filter(user=request.user, is_completed=True).exists()
        return False"""
        
    new_completed_method = """    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # We can optimize this later with prefetch_related if needed
            return obj.progress.filter(user=request.user, is_completed=True).exists()
        return False

    def get_last_position(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.progress.filter(user=request.user).first()
            if progress:
                return progress.last_position
        return 0"""
        
    serializers_code = serializers_code.replace(old_completed_method, new_completed_method)
    
    with open('apps/lms/serializers.py', 'w') as f:
        f.write(serializers_code)

# 2. Patch views.py
with open('apps/lms/views.py', 'r') as f:
    views_code = f.read()

if 'save_progress' not in views_code:
    old_perms = """        if self.action in ['complete']:"""
    new_perms = """        if self.action in ['complete', 'save_progress']:"""
    views_code = views_code.replace(old_perms, new_perms)
    
    save_progress_action = """
    @action(detail=True, methods=['post'])
    def save_progress(self, request, pk=None):
        episode = self.get_object()
        position = request.data.get('position', 0)
        try:
            position = int(float(position))
        except ValueError:
            return Response({'error': 'Invalid position'}, status=status.HTTP_400_BAD_REQUEST)
            
        progress, created = LessonProgress.objects.get_or_create(user=request.user, episode=episode)
        progress.last_position = position
        progress.save()
        
        return Response({'status': 'saved', 'position': position})
"""
    # Insert it right before def complete(self, request, pk=None):
    old_complete = """    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):"""
    
    views_code = views_code.replace(old_complete, save_progress_action + "\n" + old_complete)
    
    with open('apps/lms/views.py', 'w') as f:
        f.write(views_code)

