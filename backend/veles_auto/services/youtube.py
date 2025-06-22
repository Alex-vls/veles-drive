from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class YouTubeService:
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)

    def get_video_details(self, video_id: str) -> Optional[Dict]:
        """Get video details from YouTube"""
        try:
            request = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=video_id
            )
            response = request.execute()

            if not response['items']:
                return None

            video = response['items'][0]
            return {
                'id': video['id'],
                'title': video['snippet']['title'],
                'description': video['snippet']['description'],
                'thumbnail_url': video['snippet']['thumbnails']['high']['url'],
                'published_at': video['snippet']['publishedAt'],
                'channel_id': video['snippet']['channelId'],
                'channel_title': video['snippet']['channelTitle'],
                'duration': video['contentDetails']['duration'],
                'view_count': int(video['statistics'].get('viewCount', 0)),
                'like_count': int(video['statistics'].get('likeCount', 0)),
                'comment_count': int(video['statistics'].get('commentCount', 0))
            }
        except HttpError as e:
            logger.error(f'Error getting video details: {str(e)}')
            return None

    def search_videos(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search for videos on YouTube"""
        try:
            request = self.youtube.search().list(
                part='snippet',
                q=query,
                type='video',
                maxResults=max_results
            )
            response = request.execute()

            videos = []
            for item in response['items']:
                video_id = item['id']['videoId']
                video_details = self.get_video_details(video_id)
                if video_details:
                    videos.append(video_details)

            return videos
        except HttpError as e:
            logger.error(f'Error searching videos: {str(e)}')
            return []

    def get_channel_videos(self, channel_id: str, max_results: int = 10) -> List[Dict]:
        """Get videos from a specific channel"""
        try:
            request = self.youtube.search().list(
                part='snippet',
                channelId=channel_id,
                type='video',
                maxResults=max_results,
                order='date'
            )
            response = request.execute()

            videos = []
            for item in response['items']:
                video_id = item['id']['videoId']
                video_details = self.get_video_details(video_id)
                if video_details:
                    videos.append(video_details)

            return videos
        except HttpError as e:
            logger.error(f'Error getting channel videos: {str(e)}')
            return []

    def get_playlist_videos(self, playlist_id: str, max_results: int = 10) -> List[Dict]:
        """Get videos from a playlist"""
        try:
            request = self.youtube.playlistItems().list(
                part='snippet',
                playlistId=playlist_id,
                maxResults=max_results
            )
            response = request.execute()

            videos = []
            for item in response['items']:
                video_id = item['snippet']['resourceId']['videoId']
                video_details = self.get_video_details(video_id)
                if video_details:
                    videos.append(video_details)

            return videos
        except HttpError as e:
            logger.error(f'Error getting playlist videos: {str(e)}')
            return []

    def get_video_comments(self, video_id: str, max_results: int = 100) -> List[Dict]:
        """Get comments for a video"""
        try:
            request = self.youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=max_results,
                order='relevance'
            )
            response = request.execute()

            comments = []
            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'id': item['id'],
                    'author': comment['authorDisplayName'],
                    'text': comment['textDisplay'],
                    'like_count': comment['likeCount'],
                    'published_at': comment['publishedAt']
                })

            return comments
        except HttpError as e:
            logger.error(f'Error getting video comments: {str(e)}')
            return []

    def get_channel_details(self, channel_id: str) -> Optional[Dict]:
        """Get channel details"""
        try:
            request = self.youtube.channels().list(
                part='snippet,statistics',
                id=channel_id
            )
            response = request.execute()

            if not response['items']:
                return None

            channel = response['items'][0]
            return {
                'id': channel['id'],
                'title': channel['snippet']['title'],
                'description': channel['snippet']['description'],
                'thumbnail_url': channel['snippet']['thumbnails']['high']['url'],
                'subscriber_count': int(channel['statistics'].get('subscriberCount', 0)),
                'video_count': int(channel['statistics'].get('videoCount', 0)),
                'view_count': int(channel['statistics'].get('viewCount', 0))
            }
        except HttpError as e:
            logger.error(f'Error getting channel details: {str(e)}')
            return None 