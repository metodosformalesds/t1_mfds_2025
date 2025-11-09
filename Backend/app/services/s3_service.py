import boto3
from botocore.exceptions import ClientError
import uuid
from PIL import Image
import io
from app.config import settings

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    def upload_profile_img(self, file_content: bytes, user_id: str, max_size_mb: int = 5, allowed_formats: tuple = ('JPEG', 'PNG', 'WEBP')) -> dict:
        try:
            # Tamaño del archivo en MB
            file_size = len(file_content) / (1024 * 1024)
            if file_size > max_size_mb:
                return {"success": False, "error": f"El tamaño del archivo excede el limite de {max_size_mb} MB"}
            
            # Abrir la imagen para verificar formato
            try:
                img = Image.open(io.BytesIO(file_content))
                img_format = img.format

                if img_format not in allowed_formats:
                    return {"success": False, "error": f"Formato de imagen no permitido. Los formatos permitidos son: {", ".join(allowed_formats)}"}

            except Exception as e:
                return {"success": False, "error": f"El archivo no es una imagen válida o está corrupto. Detalle: {str(e)}"}
            
            # Redimensiona la imagen
            max_dimension = 1024
            if max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                output = io.BytesIO()
                img.save(output, format=img_format, optimize=True, quality=85)
                file_content = output.getvalue()

            # Lógica para S3
            file_ext = img_format.lower()
            file_name = f"profile_images/{user_id}/{uuid.uuid4()}.{file_ext}"

            content_types = {
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp'
            }
            content_type = content_types.get(file_ext, 'image/jpeg') 

            # Subir el archivo
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=file_content, 
                ContentType=content_type,
                Metadata={'user_id': user_id}
            )

            img_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{file_name}"

            return {"success": True, "file_url": img_url, "file_name": file_name}
        
        # --- CORRECCIÓN FINAL DE SINTAXIS (EXTERNAS) ---
        except ClientError as e:
            return {"success": False, "error": f"Error al subir a S3: {str(e)}"}
        
        except Exception as e:
            return {"success": False, "error": f"Error inesperado: {str(e)}"}
        
    def upload_product_img(self, file_content: bytes, user_id: str, max_size_mb: int = 5, allowed_formats: tuple = ('JPEG', 'PNG', 'WEBP')) -> dict:
        """Sube una imagen de producto a S3, similar a la de perfil pero con ruta diferente."""
        try:
            # Tamaño del archivo en MB
            file_size = len(file_content) / (1024 * 1024)
            if file_size > max_size_mb:
                return {"success": False, "error": f"El tamaño del archivo excede el limite de {max_size_mb} MB"}
            
            # Abrir la imagen para verificar formato
            try:
                img = Image.open(io.BytesIO(file_content))
                img_format = img.format

                if img_format not in allowed_formats:
                    return {"success": False, "error": f"Formato de imagen no permitido. Los formatos permitidos son: {", ".join(allowed_formats)}"}
            
            # --- CORRECCIÓN FINAL DE SINTAXIS ---
            except Exception as e:
                return {"success": False, "error": f"El archivo no es una imagen válida o está corrupto. Detalle: {str(e)}"}
            
            # Redimensiona la imagen
            max_dimension = 1024
            if max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                output = io.BytesIO()
                img.save(output, format=img_format, optimize=True, quality=85)
                file_content = output.getvalue()

            # Lógica para S3
            file_ext = img_format.lower()
            file_name = f"product_images/{user_id}/{uuid.uuid4()}.{file_ext}" # Carpeta diferente

            content_types = {
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp'
            }
            content_type = content_types.get(file_ext, 'image/jpeg') 

            # Subir el archivo
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=file_content, 
                ContentType=content_type,
                Metadata={'user_id': user_id}
            )

            img_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{file_name}"

            return {"success": True, "file_url": img_url, "file_name": file_name}
        
        except ClientError as e:
            return {"success": False, "error": f"Error al subir a S3: {str(e)}"}
        
        except Exception as e:
            return {"success": False, "error": f"Error inesperado: {str(e)}"}
            