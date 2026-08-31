from __future__ import annotations

# pylint: disable=missing-module-docstring, missing-function-docstring, unused-argument
import logging

from utils.notifications import send_toast as _core_send_toast

logger = logging.getLogger(__name__)


def send_toast(title: str, message: str, status: str = "success") -> None:
    del status  # Unused status placeholder preserved for backward compatibility
    try:
        _core_send_toast(title, message)
    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.warning("Falha ao disparar Toast: %s", e)
