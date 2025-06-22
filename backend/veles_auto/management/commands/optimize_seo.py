from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from veles_auto.models import Car, Company, Article, News, SEOMetadata
from veles_auto.services.seo import SEOService

class Command(BaseCommand):
    help = 'Optimize SEO metadata for all content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--content-type',
            type=str,
            help='Content type to optimize (car, company, article, news)',
        )

    def handle(self, *args, **options):
        content_type = options.get('content_type')

        if content_type:
            self.optimize_content_type(content_type)
        else:
            self.optimize_all_content()

    def optimize_content_type(self, content_type):
        if content_type == 'car':
            self.optimize_cars()
        elif content_type == 'company':
            self.optimize_companies()
        elif content_type == 'article':
            self.optimize_articles()
        elif content_type == 'news':
            self.optimize_news()
        else:
            self.stdout.write(
                self.style.ERROR(f'Unknown content type: {content_type}')
            )

    def optimize_all_content(self):
        self.optimize_cars()
        self.optimize_companies()
        self.optimize_articles()
        self.optimize_news()

    def optimize_cars(self):
        self.stdout.write('Optimizing cars...')
        cars = Car.objects.all()
        for car in cars:
            metadata = SEOService.optimize_content_seo('car', car.id)
            if metadata:
                self.stdout.write(
                    self.style.SUCCESS(f'Optimized SEO for car: {car}')
                )

    def optimize_companies(self):
        self.stdout.write('Optimizing companies...')
        companies = Company.objects.all()
        for company in companies:
            metadata = SEOService.optimize_content_seo('company', company.id)
            if metadata:
                self.stdout.write(
                    self.style.SUCCESS(f'Optimized SEO for company: {company}')
                )

    def optimize_articles(self):
        self.stdout.write('Optimizing articles...')
        articles = Article.objects.all()
        for article in articles:
            metadata = SEOService.optimize_content_seo('article', article.id)
            if metadata:
                self.stdout.write(
                    self.style.SUCCESS(f'Optimized SEO for article: {article}')
                )

    def optimize_news(self):
        self.stdout.write('Optimizing news...')
        news_items = News.objects.all()
        for news in news_items:
            metadata = SEOService.optimize_content_seo('news', news.id)
            if metadata:
                self.stdout.write(
                    self.style.SUCCESS(f'Optimized SEO for news: {news}')
                ) 