from django import forms
from .models import documents

class documentsForm(forms.ModelForm):
    class Meta:
        model = documents
        fields = ['title', 'description', 'audit_period', 'pdf_file', 'restricted', 'allowed_users']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'allowed_users': forms.SelectMultiple(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['allowed_users'].queryset = self.Meta.model._meta.get_field('allowed_users').remote_field.model.objects.all()