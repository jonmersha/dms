from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods

def custom_login(request):
    # If user is already authenticated, redirect to documents
    if request.user.is_authenticated:
        return redirect('documents:document-list')
    
    if request.method == 'POST':
        username = request.POST.get('username')  # Changed from email to username
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)  # Uses username
        
        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            
            # Redirect to next page if provided, otherwise to documents
            next_page = request.GET.get('next', 'documents:document-list')
            return redirect(next_page)
        else:
            messages.error(request, "Invalid username or password. Please try again.")
    
    return render(request, 'login.html')

def custom_logout(request):
    logout(request)
    messages.success(request, "You have been successfully logged out.")
    return redirect('home')

@login_required
def profile_view(request):
    return render(request, 'profile.html', {'user': request.user})