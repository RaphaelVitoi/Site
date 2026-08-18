# pylint: skip-file
# ruff: noqa
# pyright: reportUnusedVariable=false
"""Type stub definitions for quantum_tensor_engine C++ AVX2 extension module."""

from typing import Tuple, Union
import numpy as np
import numpy.typing as npt

FloatArray = npt.NDArray[np.float32]

class TensorDimensionError(RuntimeError):
    pass

def calculate_perspective_simd(
    equity: Union[FloatArray, npt.ArrayLike],
    pot: Union[FloatArray, npt.ArrayLike],
    human_noise_factor: float = 0.05,
) -> FloatArray: ...
def solve_icm_distortion_simd(
    fold_arr: Union[FloatArray, npt.ArrayLike],
    call_arr: Union[FloatArray, npt.ArrayLike],
    raise_arr: Union[FloatArray, npt.ArrayLike],
    ip_rp_arr: Union[FloatArray, npt.ArrayLike],
    oop_rp_arr: Union[FloatArray, npt.ArrayLike],
    pot_size_arr: Union[FloatArray, npt.ArrayLike],
    topologic_aggression: float,
    active_players: int,
    street_idx: int,
) -> Tuple[FloatArray, FloatArray, FloatArray]: ...
