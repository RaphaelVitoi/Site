# python
import json
import logging
import os
import uuid

from dotenv import load_dotenv
from locust import HttpUser, between, task

load_dotenv()

# Logging setup controlled via ENABLE_LOGGING env var
ENABLE_LOGGING = os.getenv("ENABLE_LOGGING", "True") == "True"
logging.basicConfig(level=logging.DEBUG if ENABLE_LOGGING else logging.WARNING)
log = logging.getLogger("locustfile")


class ApiUser(HttpUser):
    wait_time = between(1, 3)
    # Host - based on Postman Collection content (no explicit host provided there).
    # Override by setting ORCHESTRATOR_HOST env var, e.g. ORCHESTRATOR_HOST="http://localhost:8000"
    host = os.getenv("ORCHESTRATOR_HOST", "http://localhost:8000")
    timeout_duration = 90
    created_run_ids = []

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
        self.schedule_daily_report()

    # Helper to POST execution requests mirroring the Postman Collection operations
    def _post_execute(self, payload: dict, name: str):
        url = f"{self.host}/api/execute"
        headers = {"Content-Type": "application/json"}

        if ENABLE_LOGGING:
            log.info(f"Posting execute: {name} -> URL: {url} Payload: {json.dumps(payload)}")

        with self.client.post(
            url, json=payload, headers=headers, name=name, catch_response=True, timeout=self.timeout_duration
        ) as response:
            # Accept 200,201,202 as success for execute endpoints
            if response.status_code in (200, 201, 202):
                # Attempt to extract run id from response JSON if present
                try:
                    body = response.json()
                    run_id = body.get("id") or body.get("runId") or body.get("run_id")
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

    def run_sota_backup(self, parent_run_id: str = None):
        r"""
        Operation: sota_backup
        Description: Acionar Salvaguarda Integral do Ecossistema
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -Backup
        """
        run_id = str(uuid.uuid4())
        payload = {
            "operation": "sota_backup",
            "description": "Acionar Salvaguarda Integral do Ecossistema",
            "command": "powershell",
            "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\\do.ps1", "-Backup"],
            "run_id": run_id,
            "parent_run_id": parent_run_id,
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_backup")
        self._post_execute(payload, name="sota_backup")

    def run_sota_sync(self, parent_run_id: str = None):
        r"""
        Operation: sota_sync
        Description: Sincroniza Manifesto dos Agentes para a Realidade Fisica
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -SyncAgents
        """
        run_id = str(uuid.uuid4())
        payload = {
            "operation": "sota_sync",
            "description": "Sincroniza Manifesto dos Agentes para a Realidade Fisica",
            "command": "powershell",
            "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\\do.ps1", "-SyncAgents"],
            "run_id": run_id,
            "parent_run_id": parent_run_id,
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_sync")
        self._post_execute(payload, name="sota_sync")

    def run_sota_audit(self, parent_run_id: str = None):
        r"""
        Operation: sota_audit
        Description: Dispara Auditoria Adaptativa SOTA (Smart MDA)
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -Audit "Auditoria Global de Integridade"
        """
        run_id = str(uuid.uuid4())
        payload = {
            "operation": "sota_audit",
            "description": "Dispara Auditoria Adaptativa SOTA (Smart MDA)",
            "command": "powershell",
            "args": [
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                ".\\do.ps1",
                "-Audit",
                "Auditoria Global de Integridade",
            ],
            "run_id": run_id,
            "parent_run_id": parent_run_id,
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_audit")
        self._post_execute(payload, name="sota_audit")

    def run_sota_db_check(self, parent_run_id: str = None):
        r"""
        Operation: sota_db_check
        Description: Inspeciona integridade do DAL (SQLite)
        Command: powershell -NoProfile -ExecutionPolicy Bypass -File .\do.ps1 -CheckDB
        """
        run_id = str(uuid.uuid4())
        payload = {
            "operation": "sota_db_check",
            "description": "Inspeciona integridade do DAL (SQLite)",
            "command": "powershell",
            "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\\do.ps1", "-CheckDB"],
            "run_id": run_id,
            "parent_run_id": parent_run_id,
        }
        if ENABLE_LOGGING:
            log.info("Request: sota_db_check")
        self._post_execute(payload, name="sota_db_check")

    def schedule_daily_report(self):
        """
        Scheduling task creation as per Postman Collection scheduling.daily_report:
        Creates a scheduled task named 'daily_report' that runs sota_backup daily at 23:59.
        """
        payload = {
            "name": "daily_report",
            "operation": "sota_backup",
            "frequency": "daily",
            "timeOfDay": "23:59",
            "details": {
                "command": "powershell",
                "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\\do.ps1", "-Backup"],
            },
        }
        url = f"{self.host}/api/schedules"
        headers = {"Content-Type": "application/json"}

        if ENABLE_LOGGING:
            log.info(f"Creating schedule: daily_report -> URL: {url} Payload: {json.dumps(payload)}")

        with self.client.post(
            url,
            json=payload,
            headers=headers,
            name="schedules.create_daily_report",
            catch_response=True,
            timeout=self.timeout_duration,
        ) as response:
            if response.status_code in (200, 201):
                # store schedule id if returned
                try:
                    body = response.json()
                    sched_id = body.get("id") or body.get("scheduleId")
                    if sched_id:
                        self.created_run_ids.append({"schedule_id": sched_id})
                        if ENABLE_LOGGING:
                            log.info(f"Recorded schedule id: {sched_id}")
                except Exception:
                    if ENABLE_LOGGING:
                        log.debug("No schedule id found in response")
                response.success()
            else:
                msg = (
                    f"schedule_daily_report failed. URL={url} Status={response.status_code} "
                    f"RequestPayload={json.dumps(payload)} ResponseText={response.text}"
                )
                response.failure(msg)

    def on_stop(self):
        """
        Clean-up: attempt to delete any created runs/schedules recorded in created_run_ids.
        For runs, DELETE /api/execute/{run_id}
        For schedules, DELETE /api/schedules/{schedule_id}
        """
        if ENABLE_LOGGING:
            log.info("on_stop: cleaning up created resources")

        headers = {"Content-Type": "application/json"}
        # Attempt to delete recorded run ids
        for rid in list(self.created_run_ids):
            if isinstance(rid, dict) and "schedule_id" in rid:
                schedule_id = rid["schedule_id"]
                url = f"{self.host}/api/schedules/{schedule_id}"
                name = "schedules.delete"
            else:
                schedule_id = None
                run_id = rid
                url = f"{self.host}/api/execute/{run_id}"
                name = "execute.delete"

            if ENABLE_LOGGING:
                log.info(f"Attempting cleanup: {name} -> URL: {url}")

            with self.client.delete(
                url, headers=headers, name=name, catch_response=True, timeout=self.timeout_duration
            ) as response:
                # Accept 200 or 204
                if response.status_code in (200, 204):
                    if ENABLE_LOGGING:
                        log.info(f"Cleanup success for {url} status={response.status_code}")
                    response.success()
                else:
                    msg = f"Cleanup failed for {url} status={response.status_code} response={response.text}"
                    if ENABLE_LOGGING:
                        log.error(msg)
                    response.failure(msg)


# To run this test at the requested scale and duration:
# locust -f <this_file.py> -u 200 --run-time 120s
