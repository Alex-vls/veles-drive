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