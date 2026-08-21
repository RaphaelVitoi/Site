# python
import json
import logging
import os
import uuid
from datetime import UTC, datetime

from dotenv import load_dotenv
from locust import HttpUser, between, task  # type: ignore[import-untyped,import-not-found] # pylint: disable=import-error

load_dotenv()

# Logging setup controlled via ENABLE_LOGGING env var
ENABLE_LOGGING = os.getenv("ENABLE_LOGGING", "True") == "True"
logging.basicConfig(level=logging.DEBUG if ENABLE_LOGGING else logging.WARNING)
log = logging.getLogger("locustfile")

CONTENT_TYPE_JSON = "application/json"
DO_PS1_FILE = ".\\do.ps1"
AGENT_DISPATCHER = "@dispatcher"


class ApiUser(HttpUser):
    wait_time = between(1, 3)
    # SOTA: O Orquestrador SOTA roda na porta 17042 nativamente.
    host = os.getenv("ORCHESTRATOR_HOST", "http://127.0.0.1:17042")
    timeout_duration = 90
    created_run_ids: list[str | dict[str, str]] = []

    def on_start(self):
        # No authentication specified in the Postman Collection; do not add Authorization headers.
        # If authentication were specified, raise clear error if env vars missing (not required here).
        if ENABLE_LOGGING:
            log.info(f"Starting user. Host={self.host}")

    @task
    def run_scenario(self):
        """
        Execute the sequence defined in the Postman Collection:
        1) sota_backup
        2) sota_sync
        3) sota_audit
        4) sota_db_check
        5) schedule daily_report (sota_backup)
        """
        # Generate a unique run GUID for this scenario
        scenario_guid = str(uuid.uuid4())
        if ENABLE_LOGGING:
            log.info(f"Scenario GUID: {scenario_guid}")

        # 1) sota_backup
        self.run_sota_backup(parent_run_id=scenario_guid)

        # 2) sota_sync
        self.run_sota_sync(parent_run_id=scenario_guid)

        # 3) sota_audit
        self.run_sota_audit(parent_run_id=scenario_guid)

        # 4) sota_db_check
        self.run_sota_db_check(parent_run_id=scenario_guid)

        # 5) scheduling.daily_report (create scheduled task that references sota_backup)
        # self.schedule_daily_report() # Endpoint obsoleto na arquitetura SOTA

    # Helper to POST execution requests mirroring the Postman Collection operations
    def _post_execute(self, payload: dict, name: str):
        url = f"{self.host}/add"

        # SOTA: Autenticacao injetada para transpor a blindagem do auth_middleware (Tarpit de 2000ms)
        headers = {
            "Content-Type": CONTENT_TYPE_JSON,
            "Authorization": f"Bearer {os.getenv('API_SECRET_TOKEN', 'sota-fallback-key')}",
        }

        if ENABLE_LOGGING:
            log.info(f"Posting execute: {name} -> URL: {url} Payload: {json.dumps(payload)}")

        with self.client.post(
            url, json=payload, headers=headers, name=name, catch_response=True, timeout=self.timeout_duration
        ) as response:
            if response.status_code in (200, 201, 202):
                try:
                    body = response.json()
                    run_id = body.get("id")
                    if run_id:
                        self.created_run_ids.append(run_id)
                        if ENABLE_LOGGING:
                            log.info(f"Recorded run_id: {run_id} from response of {name}")
                except Exception:
                    # response not JSON or no id present; that's acceptable
                    if ENABLE_LOGGING:
                        log.debug(f"No JSON id found in response for {name}")
                response.success()
                return response
            msg = (
                f"{name} failed. URL={url} Status={response.status_code} "
                f"RequestPayload={json.dumps(payload)} ResponseText={response.text}"
            )
            response.failure(msg)
            return response

    # Operation implementations (match Postman Collection command & args exactly)

    def run_sota_backup(self, parent_run_id: str | None = None):
        r"""
        Operation: sota_backup
        Description: Acionar Salvaguarda Integral do Ecossistema
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -Backup
        """
        run_id = str(uuid.uuid4())
        payload = {
            "id": f"TASK-BACKUP-{run_id[:8]}",
            "description": "Acionar Salvaguarda Integral do Ecossistema",
            "agent": AGENT_DISPATCHER,
            "status": "pending",
            "timestamp": datetime.now(UTC).isoformat(),
            "metadata": {"parent_run_id": parent_run_id},
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_backup")
        self._post_execute(payload, name="sota_backup")

    def run_sota_sync(self, parent_run_id: str | None = None):
        r"""
        Operation: sota_sync
        Description: Sincroniza Manifesto dos Agentes para a Realidade Fisica
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -SyncAgents
        """
        run_id = str(uuid.uuid4())
        payload = {
            "id": f"TASK-SYNC-{run_id[:8]}",
            "description": "Sincroniza Manifesto dos Agentes para a Realidade Fisica",
            "agent": AGENT_DISPATCHER,
            "status": "pending",
            "timestamp": datetime.now(UTC).isoformat(),
            "metadata": {"parent_run_id": parent_run_id},
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_sync")
        self._post_execute(payload, name="sota_sync")

    def run_sota_audit(self, parent_run_id: str | None = None):
        r"""
        Operation: sota_audit
        Description: Dispara Auditoria Adaptativa SOTA (Smart MDA)
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -Audit "Auditoria Global de Integridade"
        """
        run_id = str(uuid.uuid4())
        payload = {
            "id": f"TASK-AUDIT-{run_id[:8]}",
            "description": "Dispara Auditoria Adaptativa SOTA (Smart MDA)",
            "agent": AGENT_DISPATCHER,
            "status": "pending",
            "timestamp": datetime.now(UTC).isoformat(),
            "metadata": {"parent_run_id": parent_run_id},
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_audit")
        self._post_execute(payload, name="sota_audit")

    def run_sota_db_check(self, parent_run_id: str | None = None):
        r"""
        Operation: sota_db_check
        Description: Inspeciona integridade do DAL (SQLite)
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -CheckDB
        """
        run_id = str(uuid.uuid4())
        payload = {
            "id": f"TASK-DBCHK-{run_id[:8]}",
            "description": "Inspeciona integridade do DAL (SQLite)",
            "agent": AGENT_DISPATCHER,
            "status": "pending",
            "timestamp": datetime.now(UTC).isoformat(),
            "metadata": {"parent_run_id": parent_run_id},
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_db_check")
        self._post_execute(payload, name="sota_db_check")


# To run this test at the requested scale and duration:
# locust -f <this_file.py> -u 200 --run-time 120s
