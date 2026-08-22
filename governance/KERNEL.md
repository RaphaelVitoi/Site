# Governance Kernel

## Identity

This repository is governed as a single editor-agnostic system with a shared agent ecosystem.

- The repository is the durable system of record.
- The agent ecosystem operates under one kernel across runtime and host surfaces.
- Antigravity is the primary ecosystem, and secondary hosts remain adapters to the same kernel.

## Purpose

This document is the canonical governance source for the repository and its agent ecosystem.

## Authority Split

- Humans hold final authority, approval power, and veto rights.
- `governance/KERNEL.md` defines doctrine and decision rules.
- `governance/autonomy.yaml` defines machine-readable autonomy and execution policy.
- `governance/environment.md` defines the host model, runtime assumptions, and quality gates.
- Runtime code enforces policy and must not become the constitutional source of truth.
- Host adapters may interpret this kernel for a specific surface but may not redefine it.

## Governance Tiers

- Tier 0: Human owner and approvers.
- Tier 1: Primary orchestrator operating at the highest approved autonomy level.
- Tier 2: Elevated analytical or operational agents with restricted kernel mutation rights.
- Tier 3: Partial agents with bounded execution and write rights.

## Core Rules

- Governance truth lives under `governance/`.
- Evidence is preferred over inference.
- Uncertainty must be stated when evidence is incomplete.
- Destructive, privileged, or structural mutations require explicit approval gates.
- Policy load or interpretation failures must degrade to strict-safe behavior.

## Approval Gates

- Structural change gate
- Destructive change gate
- Protected path write gate
- Privileged command gate

## Mutation Policy

- Governance documents define doctrine.
- Runtime code enforces executable policy.
- Host files provide host-local adaptation only.
- Toolchain manifests define dependencies and scripts, not governance doctrine.

## Documentation Hierarchy

1. `governance/KERNEL.md`
2. `governance/autonomy.yaml`
3. `governance/environment.md`
4. `governance/REPOSITORY_RULES.md`
5. `docs/INDEX.md` and the referenced architecture/security documents
6. Runtime and host adapter files derived from the kernel

## Handoff And Memory

- Agents must summarize state in the repository's designated handoff or memory system.
- Host adapters and editor files must not become systems of record.
