import json
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.utils import timezone
from django.db.models import Q
from ..models import Car, Company, Article, News, Category, Brand

class SEOService:
    @staticmethod
    def generate_seo_metadata(content_type, object_id, content):
        """Generate SEO metadata for content"""
        # Load SEO templates from JSON
        with open('seo_templates.json', 'r', encoding='utf-8') as f:
            templates = json.load(f)
        
        # Get template for content type
        template = templates.get(content_type, {})
        
        # Generate metadata based on template and content
        metadata = {
            'title': template.get('title_template', '').format(**content),
            'description': template.get('description_template', '').format(**content),
            'keywords': template.get('keywords_template', '').format(**content),
            'og_title': template.get('og_title_template', '').format(**content),
            'og_description': template.get('og_description_template', '').format(**content),
            'robots_meta': template.get('robots_meta', 'index,follow')
        }
        
        return metadata

    @staticmethod
    def optimize_content_seo(content_type, object_id):
        """Optimize SEO for content"""
        # Get content object
        if content_type == 'car':
            obj = Car.objects.get(id=object_id)
            content = {
                'brand': obj.brand.name,
                'model': obj.model,
                'year': obj.year,
                'price': obj.price,
                'transmission': obj.transmission,
                'fuel_type': obj.fuel_type,
                'body_type': obj.body_type
            }
        elif content_type == 'company':
            obj = Company.objects.get(id=object_id)
            content = {
                'name': obj.name,
                'city': obj.city,
                'rating': obj.rating
            }
        elif content_type == 'article':
            obj = Article.objects.get(id=object_id)
            content = {
                'title': obj.title,
                'category': obj.category.name if obj.category else '',
                'author': obj.author.get_full_name() or obj.author.username
            }
        elif content_type == 'news':
            obj = News.objects.get(id=object_id)
            content = {
                'title': obj.title,
                'source': obj.source
            }
        else:
            return None

        # Generate and save metadata
        metadata = SEOService.generate_seo_metadata(content_type, object_id, content)
        return metadata

class CarSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.8

    def items(self):
        return Car.objects.filter(is_available=True)

    def lastmod(self, obj):
        return obj.updated_at

class CompanySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Company.objects.filter(is_verified=True)

    def lastmod(self, obj):
        return obj.updated_at

class ArticleSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.6

    def items(self):
        return Article.objects.filter(status='published')

    def lastmod(self, obj):
        return obj.updated_at

class NewsSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.6

    def items(self):
        return News.objects.filter(status='published')

    def lastmod(self, obj):
        return obj.updated_at

class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return Category.objects.all()

    def lastmod(self, obj):
        return obj.updated_at

class BrandSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return Brand.objects.all()

    def lastmod(self, obj):
        return obj.updated_at

class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = "monthly"

    def items(self):
        return ['home', 'about', 'contact', 'search']

    def location(self, item):
        return reverse(item)

class RobotsTxtService:
    @staticmethod
    def generate_robots_txt():
        """Generate robots.txt content"""
        content = [
            "User-agent: *",
            "Disallow: /",  # Block all pages from indexing
            "Disallow: /admin/",
            "Disallow: /api/",
            "Disallow: /static/",
            "Disallow: /media/",
            "Disallow: /accounts/",
            "Disallow: /search/",
            "Disallow: /notifications/",
            "Disallow: /favorites/",
            "Disallow: /history/",
            "Disallow: /reviews/",
            "Disallow: /comments/",
            "Disallow: /reactions/",
            "Disallow: /ratings/",
            "Disallow: /analytics/",
            "Disallow: /seo/",
            "Disallow: /youtube/",
            "",
            "# Sitemap",
            "Sitemap: https://veles-auto.ru/sitemap.xml",
            "",
            "# Crawl-delay",
            "Crawl-delay: 10"
        ]
        return "\n".join(content) 