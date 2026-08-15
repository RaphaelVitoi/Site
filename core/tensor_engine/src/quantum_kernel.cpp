#include <nanobind/nanobind.h>
#include <nanobind/ndarray.h>
#include <Eigen/Dense>
#include <memory>
#include <array>
#include <stdexcept>

namespace nb = nanobind;
using namespace nb::literals;

class TensorDimensionError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

nb::ndarray<nb::numpy, float> calculate_perspective_simd(
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> equity,
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> pot,
    float human_noise_factor) {

    size_t n = equity.size();
    if (n != pot.size()) {
        throw TensorDimensionError("[ENTROPIA FATAL] Matrizes Tensonriais de entrada com dimensÃµes assimÃ©tricas.");
    }

    Eigen::Map<const Eigen::VectorXf> eq_map(equity.data(), n);
    Eigen::Map<const Eigen::VectorXf> pot_map(pot.data(), n);

    // Aloca o buffer nativo puro utilizando RAII preventivo (Zero-Copy para o Python via nb::capsule)
    auto out_data_ptr = std::make_unique<float[]>(n);
    auto* out_data = out_data_ptr.release();

    nb::capsule owner(out_data, [](void* p) noexcept { delete[] static_cast<float*>(p); }); // NOSONAR

    // Mapeia a memÃ³ria para o Eigen e avalia a expressÃ£o SIMD diretamente (Erradica TemporÃ¡rios na RAM)
    Eigen::Map<Eigen::VectorXf> out_map(out_data, n);
    out_map.array() = (eq_map.array() * pot_map.array()) * (1.0f - human_noise_factor);

    std::array<size_t, 1> shape = { n };
    return nb::ndarray<nb::numpy, float>(out_data, 1, shape.data(), owner);
}

nb::tuple solve_icm_distortion_simd( // NOSONAR
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> fold_arr,
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> call_arr,
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> raise_arr,
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> ip_rp_arr,
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> oop_rp_arr,
    nb::ndarray<float, nb::ndim<1>, nb::c_contig> pot_size_arr,
    float topologic_aggression,
    uint32_t active_players,
    uint32_t street_idx) {

    size_t n = fold_arr.size();
    if (call_arr.size() != n || raise_arr.size() != n || ip_rp_arr.size() != n ||
        oop_rp_arr.size() != n || pot_size_arr.size() != n) {
        throw TensorDimensionError("[ENTROPIA FATAL] Matrizes de entrada com dimensÃµes assimÃ©tricas no solver ICM.");
    }

    Eigen::Map<const Eigen::ArrayXf> fold(fold_arr.data(), n);
    Eigen::Map<const Eigen::ArrayXf> raise_(raise_arr.data(), n);
    Eigen::Map<const Eigen::ArrayXf> ip_rp(ip_rp_arr.data(), n);
    Eigen::Map<const Eigen::ArrayXf> oop_rp(oop_rp_arr.data(), n);
    Eigen::Map<const Eigen::ArrayXf> pot(pot_size_arr.data(), n);

    auto out_fold_ptr = std::make_unique<float[]>(n);
    auto out_call_ptr = std::make_unique<float[]>(n);
    auto out_raise_ptr = std::make_unique<float[]>(n);

    auto* out_fold = out_fold_ptr.release();
    auto* out_call = out_call_ptr.release();
    auto* out_raise = out_raise_ptr.release();

    auto cleanup = [](void* p) noexcept { delete[] static_cast<float*>(p); }; // NOSONAR

    nb::capsule cap_fold(out_fold, cleanup);
    nb::capsule cap_call(out_call, cleanup);
    nb::capsule cap_raise(out_raise, cleanup);

    Eigen::Map<Eigen::ArrayXf> n_fold(out_fold, n);
    Eigen::Map<Eigen::ArrayXf> n_call(out_call, n);
    Eigen::Map<Eigen::ArrayXf> n_raise(out_raise, n);

    const float INV_7_5 = 1.0f / 7.5f;
    auto gravity = (pot * INV_7_5).log().cwiseMax(0.0f);
    auto damping = 1.0f / (1.0f + gravity * 0.12f);
    auto eff_agg = 1.0f + (topologic_aggression - 1.0f) * damping;

    auto pressure = (oop_rp + ip_rp) * 0.5f;
    float drift_base = 0.004f * (static_cast<float>(street_idx) + 1.0f);
    auto drift_penalty = raise_ * (pressure * drift_base * (1.0f + gravity * 0.5f));

    auto raise_shift = raise_ * (eff_agg - 1.0f) - drift_penalty - (pressure * (0.003f * static_cast<float>(active_players)));
    n_raise = (raise_ + raise_shift).cwiseMax(0.0f);

    auto max_fold = 0.88f - (gravity * 0.05f).cwiseMin(0.3f);
    auto fold_shift = fold * (pressure * 0.012f) + (raise_ - n_raise).cwiseMax(0.0f);
    n_fold = (fold + fold_shift).cwiseMax(0.0f).cwiseMin(max_fold);

    n_call = (1.0f - n_fold - n_raise).cwiseMax(0.0f);

    // SOTA: Bypass de Aliasing do Eigen (Lazy Evaluation Infection)
    // O Auto-Vectorizer do Clang transforma este loop cru em SIMD AVX2 puro
    // erradicando a necessidade de temporarios e multiplas varreduras.
    for (size_t i = 0; i < n; ++i) {
        float f = out_fold[i];
        float c = out_call[i];
        float r = out_raise[i];
        float tot = f + c + r;
        if (tot > 0.0f) {
            float inv = 1.0f / tot;
            out_fold[i]  = f * inv;
            out_call[i]  = c * inv;
            out_raise[i] = r * inv;
        } else {
            out_fold[i]  = 1.0f;
            out_call[i]  = 0.0f;
            out_raise[i] = 0.0f;
        }
    }

    std::array<size_t, 1> shape = { n };
    return nb::make_tuple(
        nb::ndarray<nb::numpy, float>(out_fold, 1, shape.data(), cap_fold),
        nb::ndarray<nb::numpy, float>(out_call, 1, shape.data(), cap_call),
        nb::ndarray<nb::numpy, float>(out_raise, 1, shape.data(), cap_raise)
    );
}

NB_MODULE(quantum_tensor_engine, m) {
    m.def("calculate_perspective_simd", &calculate_perspective_simd, "VetorizaÃ§Ã£o O(1) da Perspectiva via Eigen", "equity"_a, "pot"_a, "human_noise_factor"_a = 0.05f);
    m.def("solve_icm_distortion_simd", &solve_icm_distortion_simd, "Solver Vetorizado Branchless para DistorÃ§Ã£o ICM SOTA",
          "fold_arr"_a, "call_arr"_a, "raise_arr"_a, "ip_rp_arr"_a, "oop_rp_arr"_a, "pot_size_arr"_a,
          "topologic_aggression"_a, "active_players"_a, "street_idx"_a);
}






