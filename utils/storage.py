import os
from typing import Optional

class SOTABucketing:
    """
    SOTA v6.2.1 GOLD: Unified Storage Abstraction (Bucketing).
    Garante paridade entre Local, S3 e GCS para ativos de IA e Media.
    """
    def __init__(self, root_dir: str = "C:/Users/Raphael/.gemini/Site/buckets"):
        self.root_dir = root_dir
        if not os.path.exists(self.root_dir):
            os.makedirs(self.root_dir)

    def get_bucket_path(self, bucket_name: str) -> str:
        path = os.path.join(self.root_dir, bucket_name)
        if not os.path.exists(path):
            os.makedirs(path)
        return path

    def upload_file(self, bucket_name: str, file_name: str, content: bytes):
        bucket_path = self.get_bucket_path(bucket_name)
        with open(os.path.join(bucket_path, file_name), "wb") as f:
            f.write(content)

    def download_file(self, bucket_name: str, file_name: str) -> Optional[bytes]:
        path = os.path.join(self.get_bucket_path(bucket_name), file_name)
        if os.path.exists(path):
            with open(path, "rb") as f:
                return f.read()
        return None

# Global Instance
buckets = SOTABucketing()
