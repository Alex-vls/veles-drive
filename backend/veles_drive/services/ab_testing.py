from typing import Optional, Dict, Any
from django.utils import timezone
from django.db.models import Count, Avg
from ..models import ABTest, ABTestVariant, ABTestResult

class ABTestingService:
    @staticmethod
    def get_active_test(test_name: str) -> Optional[ABTest]:
        """Получить активный A/B тест по имени"""
        now = timezone.now()
        return ABTest.objects.filter(
            name=test_name,
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).first()

    @staticmethod
    def get_variant_for_user(test: ABTest, user_id: Optional[int] = None) -> Optional[ABTestVariant]:
        """Получить вариант теста для пользователя"""
        if not test.is_active:
            return None

        # Если пользователь уже участвовал в тесте, вернуть его вариант
        if user_id:
            result = ABTestResult.objects.filter(
                test=test,
                user_id=user_id
            ).first()
            if result:
                return result.variant

        # Выбрать вариант на основе весов
        variants = list(test.variants.all())
        if not variants:
            return None

        total_weight = sum(v.weight for v in variants)
        if total_weight == 0:
            return None

        # Простое распределение по весам
        import random
        r = random.uniform(0, total_weight)
        current_weight = 0
        for variant in variants:
            current_weight += variant.weight
            if r <= current_weight:
                return variant

        return variants[0]

    @staticmethod
    def record_view(test: ABTest, variant: ABTestVariant, user_id: Optional[int] = None,
                   session_id: Optional[str] = None) -> ABTestResult:
        """Записать просмотр варианта теста"""
        return ABTestResult.objects.create(
            test=test,
            variant=variant,
            user_id=user_id,
            session_id=session_id
        )

    @staticmethod
    def record_conversion(result: ABTestResult, conversion_type: str,
                         conversion_value: float = 1.0) -> None:
        """Записать конверсию для результата теста"""
        result.conversion_type = conversion_type
        result.conversion_value = conversion_value
        result.save()

    @staticmethod
    def get_test_stats(test: ABTest) -> Dict[str, Any]:
        """Получить статистику по тесту"""
        results = ABTestResult.objects.filter(test=test)
        total_views = results.count()
        total_conversions = results.filter(conversion_value__gt=0).count()

        variant_stats = []
        for variant in test.variants.all():
            variant_results = results.filter(variant=variant)
            views = variant_results.count()
            conversions = variant_results.filter(conversion_value__gt=0).count()
            conversion_rate = (conversions / views * 100) if views > 0 else 0

            variant_stats.append({
                'name': variant.name,
                'views': views,
                'conversions': conversions,
                'conversion_rate': conversion_rate,
                'weight': variant.weight
            })

        return {
            'total_views': total_views,
            'total_conversions': total_conversions,
            'conversion_rate': (total_conversions / total_views * 100) if total_views > 0 else 0,
            'variants': variant_stats
        }

    @staticmethod
    def adjust_variant_weights(test: ABTest) -> None:
        """Автоматически скорректировать веса вариантов на основе их эффективности"""
        stats = ABTestingService.get_test_stats(test)
        variants = test.variants.all()

        # Если недостаточно данных, не корректируем веса
        if stats['total_views'] < 100:
            return

        # Вычисляем новые веса на основе конверсий
        total_conversions = sum(v['conversions'] for v in stats['variants'])
        if total_conversions == 0:
            return

        for variant, variant_stats in zip(variants, stats['variants']):
            if variant_stats['views'] > 0:
                new_weight = (variant_stats['conversions'] / total_conversions) * 100
                variant.weight = max(1, min(99, new_weight))  # Ограничиваем вес от 1 до 99
                variant.save() 