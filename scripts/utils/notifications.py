# pylint: disable=missing-module-docstring, missing-function-docstring, unused-argument
import logging
from utils.notifications import send_toast as _core_send_toast


def send_toast(title: str, message: str, status: str = "success") -> None:
    del status  # Unused status placeholder preserved for backward compatibility
    try:
        _core_send_toast(title, message)
    except Exception as e:  # pylint: disable=broad-exception-caught
        logging.warning("Falha ao disparar Toast: %s", e)
