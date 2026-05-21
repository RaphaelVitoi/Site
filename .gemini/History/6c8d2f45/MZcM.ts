// @ts-nocheck
import { resolveTelemetryCategory } from "../../components/quiz/types";

describe("quiz telemetry category contract", () => {
  it("normaliza categorias desconhecidas para o bucket seguro do simulador", () => {
    expect(resolveTelemetryCategory("Perspectiva Matemática")).toBe(
      "simulator",
    );
  });

  it("preserva categorias permitidas pelo schema de telemetria", () => {
    expect(resolveTelemetryCategory("Bolha")).toBe("Bolha");
    expect(resolveTelemetryCategory("Fundamentos SOTA")).toBe(
      "Fundamentos SOTA",
    );
  });
});
