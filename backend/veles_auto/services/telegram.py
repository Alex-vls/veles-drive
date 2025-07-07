import os
import logging
from typing import Optional, List
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class TelegramService:
    """Service for interacting with Telegram API"""
    
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.channel_id = settings.TELEGRAM_CHANNEL_ID
        self.channel_username = settings.TELEGRAM_CHANNEL_USERNAME
        self.base_url = f'https://api.telegram.org/bot{self.bot_token}'
        
    def _make_request(self, method: str, data: dict) -> Optional[dict]:
        """Make request to Telegram API"""
        try:
            response = requests.post(
                f'{self.base_url}/{method}',
                json=data
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f'Telegram API request failed: {str(e)}')
            return None
            
    def send_message(self, text: str, parse_mode: str = 'HTML') -> bool:
        """Send text message to channel"""
        data = {
            'chat_id': self.channel_id,
            'text': text,
            'parse_mode': parse_mode
        }
        result = self._make_request('sendMessage', data)
        return bool(result and result.get('ok'))
        
    def send_photo(self, photo_url: str, caption: Optional[str] = None) -> bool:
        """Send photo to channel"""
        data = {
            'chat_id': self.channel_id,
            'photo': photo_url
        }
        if caption:
            data['caption'] = caption
            data['parse_mode'] = 'HTML'
            
        result = self._make_request('sendPhoto', data)
        return bool(result and result.get('ok'))
        
    def send_media_group(self, media: List[dict]) -> bool:
        """Send group of photos/videos to channel"""
        data = {
            'chat_id': self.channel_id,
            'media': media
        }
        result = self._make_request('sendMediaGroup', data)
        return bool(result and result.get('ok'))
        
    def send_car_announcement(self, car_data: dict) -> bool:
        """Send car announcement to channel"""
        # Format car data
        text = f"""
🚗 <b>Новое объявление!</b>

<b>{car_data['brand']} {car_data['model']}</b>
Год: {car_data['year']}
Пробег: {car_data['mileage']} км
Цена: {car_data['price']} ₽

{car_data['description']}

Подробнее: {car_data['url']}
"""
        # Send text
        if not self.send_message(text):
            return False
            
        # Send photos if available
        if car_data.get('photos'):
            media = []
            for photo_url in car_data['photos']:
                media.append({
                    'type': 'photo',
                    'media': photo_url
                })
            if media:
                return self.send_media_group(media)
                
        return True

    def send_vehicle_announcement(self, vehicle_data: dict) -> bool:
        """Send vehicle announcement to channel"""
        vehicle_icons = {
            'car': '🚗',
            'motorcycle': '🏍️',
            'boat': '🚤',
            'aircraft': '✈️'
        }
        
        icon = vehicle_icons.get(vehicle_data.get('vehicle_type', 'car'), '🚗')
        
        text = f"""
{icon} <b>Новое объявление!</b>

<b>{vehicle_data['brand']} {vehicle_data['model']}</b>
Тип: {vehicle_data['vehicle_type']}
Год: {vehicle_data['year']}
Цена: {vehicle_data['price']} ₽

{vehicle_data['description']}

Подробнее: {vehicle_data['url']}
"""
        # Send text
        if not self.send_message(text):
            return False
            
        # Send photos if available
        if vehicle_data.get('photos'):
            media = []
            for photo_url in vehicle_data['photos']:
                media.append({
                    'type': 'photo',
                    'media': photo_url
                })
            if media:
                return self.send_media_group(media)
                
        return True
        
    def send_company_announcement(self, company_data: dict) -> bool:
        """Send company announcement to channel"""
        text = f"""
🏢 <b>Новая компания!</b>

<b>{company_data['name']}</b>
Город: {company_data['city']}
Рейтинг: {company_data['rating']} ⭐

{company_data['description']}

Подробнее: {company_data['url']}
"""
        # Send text
        if not self.send_message(text):
            return False
            
        # Send logo if available
        if company_data.get('logo'):
            return self.send_photo(company_data['logo'], caption=text)
            
        return True

    def send_auction_announcement(self, auction_data: dict) -> bool:
        """Send auction announcement to channel"""
        text = f"""
🏁 <b>Новый аукцион!</b>

<b>{auction_data['vehicle']['brand']} {auction_data['vehicle']['model']}</b>
Тип аукциона: {auction_data['auction_type']}
Стартовая цена: {auction_data['start_price']} ₽
Текущая цена: {auction_data['current_price']} ₽

Начало: {auction_data['start_date']}
Окончание: {auction_data['end_date']}

{auction_data['description']}

Подробнее: {auction_data['url']}
"""
        return self.send_message(text)

    def send_leasing_announcement(self, leasing_data: dict) -> bool:
        """Send leasing announcement to channel"""
        text = f"""
📋 <b>Новое предложение лизинга!</b>

<b>{leasing_data['vehicle']['brand']} {leasing_data['vehicle']['model']}</b>
Тип лизинга: {leasing_data['leasing_type']}
Ежемесячный платеж: {leasing_data['monthly_payment']} ₽
Общая сумма: {leasing_data['total_amount']} ₽

Срок: {leasing_data['duration']} месяцев
Первоначальный взнос: {leasing_data['down_payment']} ₽

{leasing_data['description']}

Подробнее: {leasing_data['url']}
"""
        return self.send_message(text)

    def send_insurance_announcement(self, insurance_data: dict) -> bool:
        """Send insurance announcement to channel"""
        text = f"""
🛡️ <b>Новое предложение страхования!</b>

<b>{insurance_data['vehicle']['brand']} {insurance_data['vehicle']['model']}</b>
Тип страхования: {insurance_data['insurance_type']}
Ежемесячная премия: {insurance_data['monthly_premium']} ₽
Общая премия: {insurance_data['total_premium']} ₽

Срок действия: {insurance_data['start_date']} - {insurance_data['end_date']}
Покрытие: {insurance_data['coverage_amount']} ₽

{insurance_data['description']}

Подробнее: {insurance_data['url']}
"""
        return self.send_message(text)

    def send_notification(self, user_id: int, message: str, parse_mode: str = 'HTML') -> bool:
        """Send notification to specific user"""
        data = {
            'chat_id': user_id,
            'text': message,
            'parse_mode': parse_mode
        }
        result = self._make_request('sendMessage', data)
        return bool(result and result.get('ok'))

    def send_broadcast(self, user_ids: List[int], message: str, parse_mode: str = 'HTML') -> dict:
        """Send broadcast message to multiple users"""
        results = {
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        for user_id in user_ids:
            try:
                if self.send_notification(user_id, message, parse_mode):
                    results['success'] += 1
                else:
                    results['failed'] += 1
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f'User {user_id}: {str(e)}')
                
        return results 