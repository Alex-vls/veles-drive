from rest_framework import generics, status, permissions, filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from core.decorators import cache_response
from core.services import NotificationService
from .models import Company, Review, CompanyImage, CompanyFeature, CompanySchedule
from .serializers import (
    CompanySerializer,
    CompanyCreateSerializer,
    CompanyUpdateSerializer,
    ReviewSerializer,
    ReviewCreateSerializer,
    ReviewUpdateSerializer,
    CompanyListSerializer,
    CompanyDetailSerializer,
    CompanyImageSerializer,
    CompanyFeatureSerializer,
    CompanyScheduleSerializer
)

class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_verified']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-rating', '-created_at']

class CompanyDetailView(generics.RetrieveAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (permissions.AllowAny,)

class CompanyCreateView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save()

class CompanyUpdateView(generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Company.objects.filter(user=self.request.user)

class CompanyDeleteView(generics.DestroyAPIView):
    queryset = Company.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Company.objects.filter(user=self.request.user)

class ReviewListView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_approved']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        company_id = self.kwargs.get('company_id')
        return Review.objects.filter(company_id=company_id)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        company_id = self.kwargs.get('company_id')
        company = Company.objects.get(id=company_id)
        serializer.save(company=company)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        company_id = self.kwargs.get('company_id')
        return Review.objects.filter(company_id=company_id)

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_object(self):
        review = super().get_object()
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if self.request.user != review.user and not self.request.user.is_staff:
                raise permissions.PermissionDenied("Вы не можете редактировать чужой отзыв")
        return review

class CompanyVerificationView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
            company.is_verified = True
            company.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Компания не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )

class ReviewApprovalView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, company_id, pk):
        try:
            review = Review.objects.get(pk=pk, company_id=company_id)
            review.is_approved = True
            review.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Review.DoesNotExist:
            return Response(
                {'error': 'Отзыв не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

class CompanyReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        company = Company.objects.get(pk=self.kwargs['company_id'])
        review = serializer.save(user=self.request.user, company=company)
        # Отправляем уведомление владельцу компании
        NotificationService.notify_company_review(company.user, company, review)
        # Очищаем кэш для компании
        cache.delete_pattern(f"view_cache_/api/companies/{company.id}/*")

class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for Company model"""
    queryset = Company.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'is_verified']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['rating', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action == 'create':
            return CompanyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CompanyUpdateSerializer
        return CompanyDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.select_related('owner')
        return queryset.select_related('owner').prefetch_related(
            'images', 'features', 'schedule'
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CompanyImageViewSet(viewsets.ModelViewSet):
    """ViewSet for CompanyImage model"""
    queryset = CompanyImage.objects.all()
    serializer_class = CompanyImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return CompanyImage.objects.filter(company__owner=self.request.user)

class CompanyFeatureViewSet(viewsets.ModelViewSet):
    """ViewSet for CompanyFeature model"""
    queryset = CompanyFeature.objects.all()
    serializer_class = CompanyFeatureSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return CompanyFeature.objects.filter(company__owner=self.request.user)

class CompanyScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for CompanySchedule model"""
    queryset = CompanySchedule.objects.all()
    serializer_class = CompanyScheduleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return CompanySchedule.objects.filter(company__owner=self.request.user) 