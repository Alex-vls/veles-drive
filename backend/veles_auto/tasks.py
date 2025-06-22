from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont
import os
from django.db.models import Avg
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from .models import (
    Company, Car, Review, CarImage,
    Article, News, Subscription, ContentView
)
from datetime import datetime, timedelta
import logging
from typing import List, Optional
from .services.telegram import TelegramService
from .services.seo import SEOService

logger = logging.getLogger(__name__)

@shared_task
def send_email_notification(subject, message, recipient_list):
    """
    Отправка email-уведомлений
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@shared_task
def process_image(image_path: str, sizes: List[tuple] = None, add_watermark: bool = True) -> Optional[str]:
    """Process image: resize, optimize, add watermark"""
    if not sizes:
        sizes = [(800, 600), (400, 300)]
        
    try:
        # Open image
        img = Image.open(image_path)
        
        # Process each size
        processed_paths = []
        for width, height in sizes:
            # Resize
            resized = img.copy()
            resized.thumbnail((width, height), Image.LANCZOS)
            
            # Add watermark if needed
            if add_watermark:
                draw = ImageDraw.Draw(resized)
                font = ImageFont.truetype('arial.ttf', 36)
                text = 'VELES AUTO'
                textwidth, textheight = draw.textsize(text, font)
                x = width - textwidth - 10
                y = height - textheight - 10
                draw.text((x, y), text, font=font, fill=(255, 255, 255, 128))
            
            # Save JPEG
            jpeg_path = f'{image_path}_{width}x{height}.jpg'
            resized.save(jpeg_path, 'JPEG', quality=85, optimize=True)
            processed_paths.append(jpeg_path)
            
            # Save WebP
            webp_path = f'{image_path}_{width}x{height}.webp'
            resized.save(webp_path, 'WEBP', quality=85, method=6)
            processed_paths.append(webp_path)
            
        return processed_paths[0]  # Return first processed image path
        
    except Exception as e:
        logger.error(f'Error processing image {image_path}: {str(e)}')
        return None

@shared_task
def update_company_ratings():
    """
    Периодическое обновление рейтингов компаний
    """
    try:
        companies = Company.objects.all()
        for company in companies:
            # Получаем средний рейтинг из отзывов
            avg_rating = Review.objects.filter(company=company).aggregate(Avg('rating'))['rating__avg']
            if avg_rating is not None:
                company.rating = round(avg_rating, 1)
                company.save()
        return True
    except Exception as e:
        print(f"Error updating company ratings: {e}")
        return False

@shared_task
def update_car_ratings():
    """
    Периодическое обновление рейтингов автомобилей
    """
    try:
        cars = Car.objects.all()
        for car in cars:
            # Получаем средний рейтинг из отзывов
            avg_rating = Review.objects.filter(car=car).aggregate(Avg('rating'))['rating__avg']
            if avg_rating is not None:
                car.rating = round(avg_rating, 1)
                car.save()
        return True
    except Exception as e:
        print(f"Error updating car ratings: {e}")
        return False

@shared_task
def send_welcome_email(user_email, user_name):
    """
    Отправка приветственного письма новому пользователю
    """
    subject = 'Добро пожаловать в VELES AUTO!'
    message = f"""
    Здравствуйте, {user_name}!
    
    Добро пожаловать в VELES AUTO - ваш надежный партнер в поиске идеального автомобиля.
    
    Теперь вы можете:
    - Просматривать каталог автомобилей
    - Оставлять отзывы
    - Следить за обновлениями
    
    Если у вас возникнут вопросы, наша служба поддержки всегда готова помочь.
    
    С уважением,
    Команда VELES AUTO
    """
    return send_email_notification.delay(subject, message, [user_email])

@shared_task
def send_review_notification(review_id):
    """
    Отправка уведомления о новом отзыве
    """
    try:
        review = Review.objects.get(id=review_id)
        if review.car:
            recipient = review.car.company.user.email
            subject = f'Новый отзыв о {review.car.brand.name} {review.car.model}'
        else:
            recipient = review.company.user.email
            subject = f'Новый отзыв о компании {review.company.name}'

        message = f"""
        Получен новый отзыв:
        
        Рейтинг: {review.rating}/5
        Комментарий: {review.comment}
        
        От: {review.user.first_name} {review.user.last_name}
        """
        return send_email_notification.delay(subject, message, [recipient])
    except Exception as e:
        print(f"Error sending review notification: {e}")
        return False

@shared_task
def cleanup_old_images(days: int = 30) -> int:
    """Clean up images older than specified days"""
    from .models import CarImage
    
    cutoff_date = datetime.now() - timedelta(days=days)
    old_images = CarImage.objects.filter(updated_at__lt=cutoff_date)
    
    count = 0
    for image in old_images:
        try:
            # Delete image files
            if os.path.exists(image.image.path):
                os.remove(image.image.path)
            if os.path.exists(image.image_webp.path):
                os.remove(image.image_webp.path)
                
            # Delete database record
            image.delete()
            count += 1
            
        except Exception as e:
            logger.error(f'Error deleting image {image.id}: {str(e)}')
            
    return count

@shared_task
def publish_car_to_telegram(car_id: int) -> bool:
    """Publish car announcement to Telegram channel"""
    from .models import Car
    
    try:
        car = Car.objects.get(id=car_id)
        
        # Prepare car data
        car_data = {
            'brand': car.brand.name,
            'model': car.model,
            'year': car.year,
            'mileage': car.mileage,
            'price': car.price,
            'description': car.description,
            'url': f'{settings.FRONTEND_URL}/cars/{car.id}',
            'photos': [img.image.url for img in car.images.all()]
        }
        
        # Send to Telegram
        telegram = TelegramService()
        return telegram.send_car_announcement(car_data)
        
    except Car.DoesNotExist:
        logger.error(f'Car {car_id} not found')
        return False
    except Exception as e:
        logger.error(f'Error publishing car {car_id} to Telegram: {str(e)}')
        return False

@shared_task
def publish_company_to_telegram(company_id: int) -> bool:
    """Publish company announcement to Telegram channel"""
    from .models import Company
    
    try:
        company = Company.objects.get(id=company_id)
        
        # Prepare company data
        company_data = {
            'name': company.name,
            'city': company.city,
            'rating': company.rating,
            'description': company.description,
            'url': f'{settings.FRONTEND_URL}/companies/{company.id}',
            'logo': company.logo.url if company.logo else None
        }
        
        # Send to Telegram
        telegram = TelegramService()
        return telegram.send_company_announcement(company_data)
        
    except Company.DoesNotExist:
        logger.error(f'Company {company_id} not found')
        return False
    except Exception as e:
        logger.error(f'Error publishing company {company_id} to Telegram: {str(e)}')
        return False

@shared_task
def send_content_notification(subscription_id: int, content_type: str, content_id: int) -> bool:
    """Send notification about new content to subscribers"""
    try:
        subscription = Subscription.objects.get(id=subscription_id)
        content_type = ContentType.objects.get(model=content_type)
        content = content_type.get_object_for_this_type(id=content_id)

        subject = f'New {content_type.model} available'
        message = f"""
        Hello {subscription.user.first_name},

        A new {content_type.model} is available that matches your subscription:

        Title: {content.title}
        Category: {content.category.name if content.category else 'None'}
        Tags: {', '.join(tag.name for tag in content.tags.all())}

        Read more: {settings.FRONTEND_URL}/{content_type.model}s/{content.slug}

        Best regards,
        VELES AUTO Team
        """

        return send_email_notification.delay(subject, message, [subscription.user.email])

    except Exception as e:
        logger.error(f'Error sending content notification: {str(e)}')
        return False

@shared_task
def notify_subscribers(content_type: str, content_id: int) -> None:
    """Notify all relevant subscribers about new content"""
    try:
        content_type = ContentType.objects.get(model=content_type)
        content = content_type.get_object_for_this_type(id=content_id)

        # Get all active subscriptions that match the content
        subscriptions = Subscription.objects.filter(is_active=True)
        
        # Filter subscriptions by category and tags
        if content.category:
            subscriptions = subscriptions.filter(
                Q(category=content.category) | Q(category__isnull=True)
            )
        
        if content.tags.exists():
            subscriptions = subscriptions.filter(
                Q(tags__in=content.tags.all()) | Q(tags__isnull=True)
            )

        # Send notifications
        for subscription in subscriptions:
            send_content_notification.delay(subscription.id, content_type.model, content_id)

    except Exception as e:
        logger.error(f'Error notifying subscribers: {str(e)}')

@shared_task
def cleanup_old_content_views(days: int = 30) -> int:
    """Clean up old content views"""
    cutoff_date = timezone.now() - timedelta(days=days)
    old_views = ContentView.objects.filter(viewed_at__lt=cutoff_date)
    count = old_views.count()
    old_views.delete()
    return count

@shared_task
def publish_article_to_telegram(article_id: int) -> bool:
    """Publish article to Telegram channel"""
    try:
        article = Article.objects.get(id=article_id)
        
        # Format article data
        text = f"""
📝 <b>New Article</b>

<b>{article.title}</b>

{article.excerpt}

Reading time: {article.reading_time} min
Category: {article.category.name if article.category else 'None'}
Tags: {', '.join(tag.name for tag in article.tags.all())}

Read more: {settings.FRONTEND_URL}/articles/{article.slug}
"""
        # Send to Telegram
        telegram = TelegramService()
        if not telegram.send_message(text):
            return False
            
        # Send featured image if available
        if article.featured_image:
            return telegram.send_photo(article.featured_image.url, caption=text)
            
        return True
        
    except Article.DoesNotExist:
        logger.error(f'Article {article_id} not found')
        return False
    except Exception as e:
        logger.error(f'Error publishing article {article_id} to Telegram: {str(e)}')
        return False

@shared_task
def publish_news_to_telegram(news_id: int) -> bool:
    """Publish news to Telegram channel"""
    try:
        news = News.objects.get(id=news_id)
        
        # Format news data
        text = f"""
📰 <b>Breaking News</b>

<b>{news.title}</b>

{news.excerpt}

Source: {news.source if news.source else 'VELES AUTO'}
Category: {news.category.name if news.category else 'None'}
Tags: {', '.join(tag.name for tag in news.tags.all())}

Read more: {settings.FRONTEND_URL}/news/{news.slug}
"""
        # Send to Telegram
        telegram = TelegramService()
        if not telegram.send_message(text):
            return False
            
        # Send featured image if available
        if news.featured_image:
            return telegram.send_photo(news.featured_image.url, caption=text)
            
        return True
        
    except News.DoesNotExist:
        logger.error(f'News {news_id} not found')
        return False
    except Exception as e:
        logger.error(f'Error publishing news {news_id} to Telegram: {str(e)}')
        return False

@shared_task
def optimize_seo_metadata():
    """Optimize SEO metadata for all content types"""
    # Optimize cars
    cars = Car.objects.all()
    for car in cars:
        SEOService.optimize_content_seo('car', car.id)

    # Optimize companies
    companies = Company.objects.all()
    for company in companies:
        SEOService.optimize_content_seo('company', company.id)

    # Optimize articles
    articles = Article.objects.all()
    for article in articles:
        SEOService.optimize_content_seo('article', article.id)

    # Optimize news
    news_items = News.objects.all()
    for news in news_items:
        SEOService.optimize_content_seo('news', news.id) 