import os
import logging

from rest_framework.exceptions import APIException
from rest_framework.views import APIView

from api.models import User, File
from api.serializer import (MyTokenObtainPairSerializer, RegisterSerializer, FileSerializer,
                            UserSerializer, ProfileSerializer)

from rest_framework.decorators import api_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from .services import DocumentUploadService, FilePreprocessingService, cloud_service

logger = logging.getLogger(__name__)


#Auth
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


#Auth
class UpdateUserAndProfileView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            user = self.request.user

            user_serializer = UserSerializer(user, data=request.data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()

            profile_instance = user.profile
            if profile_instance:
                profile_serializer = ProfileSerializer(profile_instance, data=request.data, partial=True)
            else:
                profile_serializer = ProfileSerializer(data=request.data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save(user=user)

            if profile_serializer.is_valid():
                profile_serializer.save()

                refresh = RefreshToken.for_user(user)

                token_serializer = MyTokenObtainPairSerializer()

                token = token_serializer.get_token(user)

                return Response({
                    'access': str(token),
                    'refresh': str(refresh),
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'bio': user.profile.bio,
                    'verified': user.profile.verified
                }, status=status.HTTP_200_OK)

            else:
                logger.error(f"Profile serializer errors: {profile_serializer.errors}")
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("An error occurred while updating user and profile.")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer


#DocUpload
class DocumentUploadView(APIView):
    parser_classes = (MultiPartParser,)

    def post(self, request):
        user = request.user
        file_obj = request.FILES.get('file')
        if file_obj:
            try:
                file_path = DocumentUploadService.save_uploaded_file(file_obj, 'temp_docs')
                if file_path.split('.')[-1] in ['docx', 'pdf', 'png', 'jpg']:
                    FilePreprocessingService.file_preprocessing(file_path, user)
                else:
                    return Response("Unsupported file extension", status=status.HTTP_400_BAD_REQUEST)

                return Response("File uploaded successfully", status=status.HTTP_201_CREATED)
            except APIException as e:
                return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response("File is missing", status=status.HTTP_400_BAD_REQUEST)


#DB
class FileListView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_queryset(self):
        user = self.request.user
        return File.objects.filter(user=user)


#Cloud
class DownloadFileView(APIView):
    def get(self, request, file_id):
        file_obj = get_object_or_404(File, id=file_id)
        cloud_link = file_obj.cloud_link
        local_file_path = cloud_service.download_file(cloud_link)

        def file_iterator(file_path, chunk_size=8192):
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk

        response = HttpResponse(file_iterator(local_file_path), content_type='application/octet-stream')
        response['Content-Disposition'] = 'attachment; filename="{0}"'.format(os.path.basename(local_file_path))
        response['Content-Length'] = os.path.getsize(local_file_path)

        if os.path.exists(local_file_path):
            os.remove(local_file_path)

        return response


#DB and Cloud
class DeleteDocumentView(APIView):
    def delete(self, request, file_id):
        file_obj = get_object_or_404(File, id=file_id)
        cloud_service.delete_file(file_obj.cloud_link)
        file_obj.delete()

        return Response(status=204)


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/'
    ]
    return Response(routes)
