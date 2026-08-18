cmake_minimum_required(VERSION 3.20)
project(QuantumTensorEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# SOTA: Força a emissão da compilation database para fricção zero no LSP/SonarLint
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# SOTA: Blindagem contra MSVC STL 17.13+ vs Clang 18
add_compile_definitions(_ALLOW_COMPILER_AND_STL_VERSION_MISMATCH)

# 1. Localizacao do Interpretador e Headers Python (com autodeteccao do venv local)
if(NOT Python_EXECUTABLE)
    if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/Scripts/python.exe")
        set(Python_EXECUTABLE "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/Scripts/python.exe")
    elseif(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/bin/python")
        set(Python_EXECUTABLE "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/bin/python")
    endif()
endif()
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# 2. Recuperar Diretorio do Nanobind a partir do executavel Python resolvido
execute_process(
    COMMAND "${Python_EXECUTABLE}" -m nanobind --cmake_dir
    OUTPUT_VARIABLE NB_DIR
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET
)
if(NB_DIR)
    list(APPEND CMAKE_PREFIX_PATH "${NB_DIR}")
endif()
find_package(nanobind CONFIG REQUIRED)

# 2. Resolução do Vendor SOTA (Álgebra Linear Eigen)
set(VENDOR_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../vendor")
include_directories(${VENDOR_DIR}/eigen)

# 3. Forjamento do Módulo (Extensão C++ para o Python)
nanobind_add_module(quantum_tensor_engine src/quantum_kernel.cpp)

# 4. Otimização Termodinâmica LLVM/MSVC
target_compile_options(quantum_tensor_engine PRIVATE /O2 /fp:fast /arch:AVX2)
