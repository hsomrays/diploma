import os

from rest_framework.exceptions import APIException
from rest_framework.views import APIView

from api.models import User, File
from api.serializer import MyTokenObtainPairSerializer, RegisterSerializer, FileSerializer

from rest_framework.decorators import api_view
from rest_framework import generics, status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from .services import DocumentUploadService, FilePreprocessingService, cloud_service


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer


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


class FileListView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_queryset(self):
        user = self.request.user
        return File.objects.filter(user=user)


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
