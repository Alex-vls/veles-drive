from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('companies', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('brand', models.CharField(max_length=100, verbose_name='Марка')),
                ('model', models.CharField(max_length=100, verbose_name='Модель')),
                ('year', models.IntegerField(verbose_name='Год выпуска')),
                ('mileage', models.IntegerField(verbose_name='Пробег')),
                ('transmission', models.CharField(choices=[('manual', 'Механическая'), ('automatic', 'Автоматическая'), ('robot', 'Робот'), ('variator', 'Вариатор')], max_length=20, verbose_name='Коробка передач')),
                ('fuel_type', models.CharField(choices=[('petrol', 'Бензин'), ('diesel', 'Дизель'), ('hybrid', 'Гибрид'), ('electric', 'Электро')], max_length=20, verbose_name='Тип топлива')),
                ('engine_volume', models.DecimalField(decimal_places=1, max_digits=3, verbose_name='Объем двигателя')),
                ('power', models.IntegerField(verbose_name='Мощность (л.с.)')),
                ('color', models.CharField(max_length=50, verbose_name='Цвет')),
                ('price', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Цена')),
                ('description', models.TextField(verbose_name='Описание')),
                ('is_available', models.BooleanField(default=True, verbose_name='Доступен')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cars', to='companies.company', verbose_name='Компания')),
            ],
            options={
                'verbose_name': 'Автомобиль',
                'verbose_name_plural': 'Автомобили',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='CarImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='cars/images/', verbose_name='Изображение')),
                ('is_main', models.BooleanField(default=False, verbose_name='Главное изображение')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('car', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='cars.car', verbose_name='Автомобиль')),
            ],
            options={
                'verbose_name': 'Изображение автомобиля',
                'verbose_name_plural': 'Изображения автомобилей',
                'ordering': ['-is_main', '-created_at'],
            },
        ),
    ] 