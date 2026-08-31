"""Module for providing unified storage abstraction (Bucketing)."""

from pathlib import Path, PureWindowsPath

from core.config import BASE_DIR


class SOTABucketing:
    """
    SOTA v7.0 GOLD: Unified Storage Abstraction (Bucketing).
    Garante paridade entre Local, S3 e GCS para ativos de IA e Media.
    """

    def __init__(self, root_dir: Path | str | None = None):
        requested_root = BASE_DIR / "data" / "buckets" if root_dir is None else Path(root_dir)
        self.root_dir = requested_root.resolve()
        self.root_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _validate_name(value: str, field_name: str) -> str:
        """Accept one path component only, never a caller-controlled path."""
        if not value or value in {".", ".."}:
            raise ValueError(f"{field_name} must be a non-empty file-system name")

        native_path = Path(value)
        windows_path = PureWindowsPath(value)
        if (
            native_path.is_absolute()
            or windows_path.is_absolute()
            or native_path.name != value
            or windows_path.name != value
        ):
            raise ValueError(f"{field_name} must not contain a path or drive prefix")
        return value

    def _resolve_bucket_path(self, bucket_name: str) -> Path:
        safe_bucket = self._validate_name(bucket_name, "bucket")
        bucket_path = (self.root_dir / safe_bucket).resolve()
        if not bucket_path.is_relative_to(self.root_dir):
            raise ValueError("bucket resolves outside the storage root")
        return bucket_path

    def _resolve_file_path(self, bucket_name: str, file_name: str) -> Path:
        safe_file = self._validate_name(file_name, "filename")
        file_path = (self._resolve_bucket_path(bucket_name) / safe_file).resolve()
        if not file_path.is_relative_to(self.root_dir):
            raise ValueError("filename resolves outside the storage root")
        return file_path

    def get_bucket_path(self, bucket_name: str) -> Path:
        """Get the absolute path for a specific bucket."""
        bucket_path = self._resolve_bucket_path(bucket_name)
        bucket_path.mkdir(parents=True, exist_ok=True)
        return bucket_path

    def upload_file(self, bucket_name: str, file_name: str, content: bytes):
        """Upload a file to the specified bucket."""
        file_path = self._resolve_file_path(bucket_name, file_name)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(content)

    def download_file(self, bucket_name: str, file_name: str) -> bytes | None:
        """Download a file from the specified bucket."""
        file_path = self._resolve_file_path(bucket_name, file_name)
        if file_path.exists():
            return file_path.read_bytes()
        return None


# Global Instance
buckets = SOTABucketing()
