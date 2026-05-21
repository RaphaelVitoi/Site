import os
import psutil
try:
    import torch
except ImportError:
    torch = None

class ResourceGuard:
    """
    SOTA v6.2.1 GOLD: Monitor de VRAM e RAM.
    Garante que o motor de IA nao cause Page Faults ou OOM no sistema.
    """
    @staticmethod
    def get_vram_usage() -> dict:
        if torch and torch.cuda.is_available():
            return {
                "total": torch.cuda.get_device_properties(0).total_memory / (1024**3),
                "allocated": torch.cuda.memory_allocated(0) / (1024**3),
                "reserved": torch.cuda.memory_reserved(0) / (1024**3),
                "free": (torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_reserved(0)) / (1024**3)
            }
        return {"error": "CUDA not available"}

    @staticmethod
    def get_ram_usage() -> dict:
        vm = psutil.virtual_memory()
        return {
            "total": vm.total / (1024**3),
            "available": vm.available / (1024**3),
            "percent": vm.percent
        }

    @staticmethod
    def check_health(vram_limit: float = 12.0, ram_reserve: float = 4.0) -> bool:
        ram = ResourceGuard.get_ram_usage()
        if ram["available"] < ram_reserve:
            return False
        
        vram = ResourceGuard.get_vram_usage()
        if "error" not in vram and vram["allocated"] > vram_limit:
            return False
            
        return True
