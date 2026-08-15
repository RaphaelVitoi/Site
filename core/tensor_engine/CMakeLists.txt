cmake_minimum_required(VERSION 3.20)
project(QuantumTensorEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# SOTA: Força a emissão da compilation database para fricção zero no LSP/SonarLint
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# SOTA: Blindagem contra MSVC STL 17.13+ vs Clang 18
add_compile_definitions(_ALLOW_COMPILER_AND_STL_VERSION_MISMATCH)

# 1. Recuperar Diretório do Nanobind a partir do interpretador Python local
execute_process(
    COMMAND python -m nanobind --cmake_dir
    OUTPUT_VARIABLE NB_DIR
    OUTPUT_STRIP_TRAILING_WHITESPACE
)
list(APPEND CMAKE_PREFIX_PATH "${NB_DIR}")
find_package(Python COMPONENTS Interpreter Development REQUIRED)
find_package(nanobind CONFIG REQUIRED)

# 2. Resolução do Vendor SOTA (Álgebra Linear Eigen)
set(VENDOR_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../vendor")
include_directories(${VENDOR_DIR}/eigen)

# 3. Forjamento do Módulo (Extensão C++ para o Python)
nanobind_add_module(quantum_tensor_engine src/quantum_kernel.cpp)

# 4. Otimização Termodinâmica LLVM/MSVC
target_compile_options(quantum_tensor_engine PRIVATE /O2 /fp:fast /arch:AVX2)
