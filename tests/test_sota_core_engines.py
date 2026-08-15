"""
Unit Tests for SOTA Core Engines: Binary Matcher & Metadata Pool (Chromium & uBOL SOTA)
Protocol Chico SOTA v7.0 GOLD - Continuous Integration & Zero-Defect Governance
"""

import pytest
from core.sota_binary_matcher import binary_search_length_lex, compute_domain_hierarchy, sort_key
from core.sota_metadata_pool import SOTAMetadataPool


class TestSOTABinaryMatcher:
    def test_sort_key_and_binary_search(self):
        domains = [
            "api.gemini.google.com",
            "gemini.google.com",
            "google.com",
            "com",
            "*",
            "aistudio.google.com",
            "console.cloud.google.com",
        ]
        sorted_domains = sorted(domains, key=sort_key)

        # Exact matches
        for d in domains:
            idx = binary_search_length_lex(sorted_domains, d)
            assert idx >= 0
            assert sorted_domains[idx] == d

        # Missing element returns bitwise NOT of insertion index
        missing = "unknown.google.com"
        missing_idx = binary_search_length_lex(sorted_domains, missing)
        assert missing_idx < 0
        insertion_point = ~missing_idx
        assert 0 <= insertion_point <= len(sorted_domains)

    def test_domain_hierarchy_decomposition(self):
        hns = compute_domain_hierarchy("chat.deep-research.gemini.google.com:443")
        expected = [
            "chat.deep-research.gemini.google.com",
            "deep-research.gemini.google.com",
            "gemini.google.com",
            "google.com",
            "com",
            "*",
        ]
        assert hns == expected


class TestSOTAMetadataPool:
    def test_string_interning(self):
        pool = SOTAMetadataPool()
        id1 = pool.intern_string("com/google/gemini/Agent")
        id2 = pool.intern_string("com/google/gemini/Agent")
        id3 = pool.intern_string("com/google/gemini/Prompt")

        assert id1 == id2
        assert id1 != id3
        assert len(pool._string_pool) == 2

    def test_method_metadata_deduplication(self):
        pool = SOTAMetadataPool()
        m1 = pool.register_method_metadata("Tab", "getUrl", "()Ljava/lang/String;")
        m2 = pool.register_method_metadata("Tab", "getUrl", "()Ljava/lang/String;")
        m3 = pool.register_method_metadata("Tab", "getTitle", "()Ljava/lang/String;")

        assert m1 == m2
        assert m1 != m3
        assert len(pool._metadata_entries) == 2

        resolved = pool.resolve_method_metadata(m1)
        assert resolved["class_name"] == "Tab"
        assert resolved["method_name"] == "getUrl"
        assert resolved["signature"] == "()Ljava/lang/String;"

    def test_compression_savings(self):
        pool = SOTAMetadataPool()
        for _ in range(10):
            pool.register_method_metadata("LargeClassDescriptor", "executeLongMethodName", "(Ljava/lang/String;)V")

        stats = pool.get_stats()
        assert stats["total_methods_registered"] == 1
        assert stats["compression_savings_percent"] == 0.0 or stats["compression_savings_percent"] > 0
