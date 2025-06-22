from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название компании')),
                ('description', models.TextField(verbose_name='Описание')),
                ('address', models.CharField(max_length=255, verbose_name='Адрес')),
                ('logo', models.ImageField(upload_to='companies/logos/', verbose_name='Логотип')),
                ('rating', models.DecimalField(decimal_places=2, default=0, max_digits=3, verbose_name='Рейтинг')),
                ('is_verified', models.BooleanField(default=False, verbose_name='Верифицирована')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='company', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Компания',
                'verbose_name_plural': 'Компании',
                'ordering': ['-rating', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(verbose_name='Оценка')),
                ('text', models.TextField(verbose_name='Текст отзыва')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('is_approved', models.BooleanField(default=False, verbose_name='Одобрен')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='companies.company', verbose_name='Компания')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Отзыв',
                'verbose_name_plural': 'Отзывы',
                'ordering': ['-created_at'],
            },
        ),
    ] 