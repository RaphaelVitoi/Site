from locust import HttpUser, task, between


class FrontendUser(HttpUser):
    wait_time = between(0.1, 0.4)
    host = "http://localhost:3000"

    @task(4)
    def test_home(self):
        self.client.get("/", name="GET /")

    @task(3)
    def test_biblioteca(self):
        self.client.get("/biblioteca", name="GET /biblioteca")

    @task(3)
    def test_simulador(self):
        self.client.get("/simulador/gto-cfr", name="GET /simulador/gto-cfr")

    @task(2)
    def test_bayesian_range(self):
        self.client.post(
            "/api/sota/bayesian-range",
            json={"equity": 0.48, "actionStrength": 0.65, "rangeDensity": 0.25},
            headers={"Content-Type": "application/json"},
            name="POST /api/sota/bayesian-range",
        )
