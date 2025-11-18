from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    path('', views.DocumentListView.as_view(), name='document-list'),
    path('<int:pk>/download/', views.DocumentDownloadView.as_view(), name='document-download'),
]