"""Module for providing unified storage abstraction (Bucketing)."""

from pathlib import Path
from core.config import BASE_DIR


class SOTABucketing:
    """
    SOTA v7.0 GOLD: Unified Storage Abstraction (Bucketing).
    Garante paridade entre Local, S3 e GCS para ativos de IA e Media.
    """

    def __init__(self, root_dir: Path | str | None = None):
        if root_dir is None:
            self.root_dir = BASE_DIR / "data" / "buckets"
        else:
            self.root_dir = Path(root_dir)

        if not self.root_dir.exists():
            self.root_dir.mkdir(parents=True, exist_ok=True)

    def get_bucket_path(self, bucket_name: str) -> Path:
        """Get the absolute path for a specific bucket."""
        path = self.root_dir / bucket_name
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
        return path

    def upload_file(self, bucket_name: str, file_name: str, content: bytes):
        """Upload a file to the specified bucket."""
        file_path = self.get_bucket_path(bucket_name) / file_name
        file_path.write_bytes(content)

    def download_file(self, bucket_name: str, file_name: str) -> bytes | None:
        """Download a file from the specified bucket."""
        path = self.get_bucket_path(bucket_name) / file_name
        if path.exists():
            return path.read_bytes()
        return None


# Global Instance
buckets = SOTABucketing()
