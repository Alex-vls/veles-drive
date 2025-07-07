from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Review, Car, Company, Article, ContentImage, YouTubeVideo, YouTubePlaylistVideo, PageView, UserSession
from .tasks import (
    send_review_notification,
    publish_car_to_telegram,
    publish_company_to_telegram,
    publish_article_to_telegram,
    publish_news_to_telegram,
    process_image,
    handle_page_view,
    handle_session_end
)

@receiver(post_save, sender=Review)
def handle_review_save(sender, instance, created, **kwargs):
    if created:
        send_review_notification.delay(instance.id)

@receiver(post_save, sender=Car)
def handle_car_save(sender, instance, created, **kwargs):
    if created:
        publish_car_to_telegram.delay(instance.id)

@receiver(post_save, sender=Company)
def handle_company_save(sender, instance, created, **kwargs):
    if created:
        publish_company_to_telegram.delay(instance.id)

@receiver(post_save, sender=Article)
def handle_article_save(sender, instance, created, **kwargs):
    if created:
        publish_article_to_telegram.delay(instance.id)

# @receiver(post_save, sender=News)
# def handle_news_save(sender, instance, created, **kwargs):
#     if created:
#         publish_news_to_telegram.delay(instance.id)

@receiver(post_save, sender=ContentImage)
def handle_content_image_save(sender, instance, created, **kwargs):
    if created and instance.image:
        process_image.delay(instance.image.path)

@receiver(post_save, sender=PageView)
def handle_page_view_save(sender, instance, created, **kwargs):
    if created:
        handle_page_view.delay(instance.id)

@receiver(post_save, sender=UserSession)
def handle_user_session_save(sender, instance, **kwargs):
    if instance.end_time:
        handle_session_end.delay(instance.id) 