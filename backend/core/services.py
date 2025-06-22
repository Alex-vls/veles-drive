from django.conf import settings
from .models import Notification

class NotificationService:
    @staticmethod
    def create_notification(user, type, title, message, data=None):
        """
        Создает новое уведомление для пользователя.
        
        Args:
            user: Пользователь, которому отправляется уведомление
            type: Тип уведомления (из Notification.NOTIFICATION_TYPES)
            title: Заголовок уведомления
            message: Текст уведомления
            data: Дополнительные данные в формате JSON (опционально)
        """
        notification = Notification.objects.create(
            user=user,
            type=type,
            title=title,
            message=message,
            data=data or {}
        )
        return notification

    @staticmethod
    def notify_car_review(user, car, review):
        """
        Создает уведомление о новом отзыве на автомобиль.
        """
        title = f"Новый отзыв на автомобиль {car.brand} {car.model}"
        message = f"Пользователь {review.user.username} оставил отзыв на ваш автомобиль."
        data = {
            'car_id': car.id,
            'review_id': review.id
        }
        return NotificationService.create_notification(
            user=user,
            type='car_review',
            title=title,
            message=message,
            data=data
        )

    @staticmethod
    def notify_company_review(user, company, review):
        """
        Создает уведомление о новом отзыве на компанию.
        """
        title = f"Новый отзыв на компанию {company.name}"
        message = f"Пользователь {review.user.username} оставил отзыв на вашу компанию."
        data = {
            'company_id': company.id,
            'review_id': review.id
        }
        return NotificationService.create_notification(
            user=user,
            type='company_review',
            title=title,
            message=message,
            data=data
        )

    @staticmethod
    def notify_car_status(user, car):
        """
        Создает уведомление об изменении статуса автомобиля.
        """
        status = "доступен" if car.is_available else "недоступен"
        title = f"Изменение статуса автомобиля {car.brand} {car.model}"
        message = f"Ваш автомобиль теперь {status}."
        data = {
            'car_id': car.id,
            'is_available': car.is_available
        }
        return NotificationService.create_notification(
            user=user,
            type='car_status',
            title=title,
            message=message,
            data=data
        )

    @staticmethod
    def notify_subscription(user, subscription_type, end_date):
        """
        Создает уведомление о подписке.
        """
        title = "Информация о подписке"
        message = f"Ваша подписка {subscription_type} действительна до {end_date.strftime('%d.%m.%Y')}."
        data = {
            'subscription_type': subscription_type,
            'end_date': end_date.isoformat()
        }
        return NotificationService.create_notification(
            user=user,
            type='subscription',
            title=title,
            message=message,
            data=data
        )

    @staticmethod
    def notify_system(user, title, message, data=None):
        """
        Создает системное уведомление.
        """
        return NotificationService.create_notification(
            user=user,
            type='system',
            title=title,
            message=message,
            data=data
        ) 