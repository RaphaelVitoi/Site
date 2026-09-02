cmake_minimum_required(VERSION 3.20)
project(QuantumTensorEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# SOTA: Força a emissão da compilation database para fricção zero no LSP/SonarLint
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# SOTA: Blindagem contra MSVC STL 17.13+ vs Clang 18
add_compile_definitions(_ALLOW_COMPILER_AND_STL_VERSION_MISMATCH)

# 1. Localizacao do Interpretador e Headers Python (com autodeteccao do venv local)
if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/Scripts/python.exe")
    get_filename_component(_LOCAL_PYTHON "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/Scripts/python.exe" ABSOLUTE)
    set(Python_EXECUTABLE "${_LOCAL_PYTHON}" CACHE FILEPATH "Python executable" FORCE)
    set(Python3_EXECUTABLE "${_LOCAL_PYTHON}" CACHE FILEPATH "Python3 executable" FORCE)
elseif(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/bin/python")
    get_filename_component(_LOCAL_PYTHON "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/bin/python" ABSOLUTE)
    set(Python_EXECUTABLE "${_LOCAL_PYTHON}" CACHE FILEPATH "Python executable" FORCE)
    set(Python3_EXECUTABLE "${_LOCAL_PYTHON}" CACHE FILEPATH "Python3 executable" FORCE)
endif()
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# 2. Recuperar Diretorio do Nanobind a partir do venv ou executavel Python
if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/Lib/site-packages/nanobind/cmake")
    get_filename_component(NB_DIR_LOCAL "${CMAKE_CURRENT_SOURCE_DIR}/../../.venv/Lib/site-packages/nanobind/cmake" ABSOLUTE)
    file(TO_CMAKE_PATH "${NB_DIR_LOCAL}" NB_DIR_CMAKE)
    list(APPEND CMAKE_PREFIX_PATH "${NB_DIR_CMAKE}")
    set(nanobind_DIR "${NB_DIR_CMAKE}" CACHE PATH "Nanobind CMake Directory" FORCE)
endif()

if(NOT nanobind_DIR)
    execute_process(
        COMMAND "${Python_EXECUTABLE}" -m nanobind --cmake_dir
        OUTPUT_VARIABLE NB_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE
        ERROR_QUIET
    )
    if(NOT NB_DIR)
        execute_process(
            COMMAND "${Python_EXECUTABLE}" -c "import nanobind; print(nanobind.cmake_dir())"
            OUTPUT_VARIABLE NB_DIR
            OUTPUT_STRIP_TRAILING_WHITESPACE
            ERROR_QUIET
        )
    endif()
    if(NB_DIR)
        file(TO_CMAKE_PATH "${NB_DIR}" NB_DIR_CMAKE)
        list(APPEND CMAKE_PREFIX_PATH "${NB_DIR_CMAKE}")
        set(nanobind_DIR "${NB_DIR_CMAKE}" CACHE PATH "Nanobind CMake Directory" FORCE)
    endif()
endif()
find_package(nanobind CONFIG REQUIRED)

# 2. Resolução do Vendor SOTA (Álgebra Linear Eigen)
set(VENDOR_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../vendor")
include_directories(${VENDOR_DIR}/eigen)

# 3. Forjamento do Módulo (Extensão C++ para o Python)
nanobind_add_module(quantum_tensor_engine src/quantum_kernel.cpp)

# 4. Otimizacao Termodinamica -- flags por compilador, nao por suposicao
#
# Ate 2026-09-01 esta linha era `PRIVATE /O2 /fp:fast /arch:AVX2`, sintaxe
# exclusiva do MSVC. O g++ e o clang rejeitam, entao o modulo NAO compilava fora
# do Windows e os tres testes de isometria de tests/test_tensor_engine.py
# pulavam com "Modulo quantum_tensor_engine nao compilado no ambiente" -- em
# qualquer agente, e no CI ubuntu-latest.
#
# A equivalencia nao e exata e nao se finge que e: /fp:fast e -ffast-math dao
# garantias diferentes de ponto flutuante. O que autoriza o port sao os proprios
# testes, que ja declaram tolerancia de fast-math (rtol 5e-3 no ICM, 1e-5 na
# perspectiva) e exigem conservacao estrita de probabilidade a 1e-4. Se o port
# violasse a isometria, eles reprovariam -- e e assim que ele foi verificado,
# nao por analogia entre nomes de flag.
if(MSVC)
    target_compile_options(quantum_tensor_engine PRIVATE /O2 /fp:fast /arch:AVX2)
else()
    target_compile_options(quantum_tensor_engine PRIVATE -O2 -ffast-math -mavx2)
endif()
