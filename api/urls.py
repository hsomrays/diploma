from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from api import views
from api.views import DocumentUploadView, FileListView, DeleteDocumentView

urlpatterns = [
    path("token/", views.MyTokenObtainPairView.as_view()),
    path("register/", views.RegisterUserView.as_view()),
    path("update_user/", views.UpdateUserView.as_view(), name="update_user"),
    path("update_profile/", views.UpdateProfileView.as_view(), name="update_profile"),
    path("update_user_profile/", views.UpdateUserAndProfileView.as_view(), name="update_user_profile"),
    path('uploadDocument/', DocumentUploadView.as_view(), name='upload_document'),
    path('getUserDocuments/', FileListView.as_view(), name='get_user_documents'),
    path('downloadDocument/<int:file_id>/', views.DownloadFileView.as_view(), name='download_file'),
    path('deleteDocument/<int:file_id>/', DeleteDocumentView.as_view(), name='delete_document'),
    path('', views.getRoutes),
]