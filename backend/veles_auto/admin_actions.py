from django.contrib import admin
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from .models import Article, News, Review, Comment, Company

def approve_content(modeladmin, request, queryset):
    """Approve selected content items"""
    for item in queryset:
        item.status = 'published'
        item.published_at = timezone.now()
        item.save()
        
        # Send notification to author
        if hasattr(item, 'author'):
            subject = f'Your content has been approved'
            message = f'Your {item.__class__.__name__.lower()} "{item.title}" has been approved and published.'
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [item.author.email],
                fail_silently=True,
            )
approve_content.short_description = "Approve selected content"

def reject_content(modeladmin, request, queryset):
    """Reject selected content items"""
    for item in queryset:
        item.status = 'rejected'
        item.save()
        
        # Send notification to author
        if hasattr(item, 'author'):
            subject = f'Your content has been rejected'
            message = f'Your {item.__class__.__name__.lower()} "{item.title}" has been rejected.'
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [item.author.email],
                fail_silently=True,
            )
reject_content.short_description = "Reject selected content"

def verify_companies(modeladmin, request, queryset):
    """Verify selected companies"""
    for company in queryset:
        company.is_verified = True
        company.save()
        
        # Send notification to company owner
        subject = 'Your company has been verified'
        message = f'Your company "{company.name}" has been verified on VELES AUTO.'
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [company.user.email],
            fail_silently=True,
        )
verify_companies.short_description = "Verify selected companies"

def unverify_companies(modeladmin, request, queryset):
    """Unverify selected companies"""
    for company in queryset:
        company.is_verified = False
        company.save()
        
        # Send notification to company owner
        subject = 'Your company verification has been revoked'
        message = f'The verification of your company "{company.name}" has been revoked on VELES AUTO.'
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [company.user.email],
            fail_silently=True,
        )
unverify_companies.short_description = "Unverify selected companies"

def delete_spam(modeladmin, request, queryset):
    """Delete spam content"""
    for item in queryset:
        item.delete()
delete_spam.short_description = "Delete spam content"

def ban_users(modeladmin, request, queryset):
    """Ban selected users"""
    for user in queryset:
        user.is_active = False
        user.save()
        
        # Send notification to user
        subject = 'Your account has been banned'
        message = 'Your account has been banned from VELES AUTO.'
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
ban_users.short_description = "Ban selected users"

def unban_users(modeladmin, request, queryset):
    """Unban selected users"""
    for user in queryset:
        user.is_active = True
        user.save()
        
        # Send notification to user
        subject = 'Your account has been unbanned'
        message = 'Your account has been unbanned on VELES AUTO.'
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
unban_users.short_description = "Unban selected users"

def export_as_json(modeladmin, request, queryset):
    """Export selected items as JSON"""
    import json
    from django.http import HttpResponse
    
    data = []
    for item in queryset:
        data.append({
            'id': item.id,
            'title': getattr(item, 'title', str(item)),
            'created_at': item.created_at.isoformat(),
            'updated_at': item.updated_at.isoformat(),
        })
    
    response = HttpResponse(
        json.dumps(data, indent=2),
        content_type='application/json'
    )
    response['Content-Disposition'] = 'attachment; filename=export.json'
    return response
export_as_json.short_description = "Export selected items as JSON" 