"""
Test skill packaging invariants for all 14 skills.

This module validates:
- Required files present (SKILL.md, _meta.json)
- Frontmatter is parseable YAML
- Non-empty name/description in frontmatter
- _meta.json includes required fields: ownerId, slug, version, publishedAt
- Policy: frontmatter name MUST exactly equal folder name AND _meta.json.slug
"""

import json
import pytest
import re
from pathlib import Path

# Base directory for skills
SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"

# List of all 14 skills
ALL_SKILLS = [
    "blogwatcher",
    "crypto-market-data",
    "finance-news",
    "find-skills",
    "gemini-deep-research",
    "github",
    "news-aggregator-skill",
    "reddit-insights",
    "self-improving-agent",
    "stock-analysis",
    "summarize",
    "trading-research",
    "web-search",
    "x-research",
]


def extract_yaml_frontmatter(content: str) -> dict:
    """
    Extract YAML frontmatter from a markdown file.
    
    Expected format:
    ---
    name: xxx
    description: xxx
    ---
    
    Returns a dict with the parsed YAML, or raises an exception.
    """
    # Match --- at start and --- at end (with optional whitespace)
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, content, re.DOTALL)
    if not match:
        raise ValueError("No YAML frontmatter found")
    
    yaml_content = match.group(1)
    
    # Simple YAML parsing for our specific use case
    # We only need to parse key: value pairs
    result = {}
    for line in yaml_content.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        # Handle key: value format
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            # Handle quoted values
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            elif value.startswith("'") and value.endswith("'"):
                value = value[1:-1]
            
            # Handle metadata key with JSON-like value
            if key == 'metadata':
                # For metadata, just store the raw string
                result[key] = value
            else:
                result[key] = value
    
    return result


def load_skill_frontmatter(skill_folder: str) -> dict:
    """Load and parse YAML frontmatter from SKILL.md"""
    skill_path = SKILLS_DIR / skill_folder / "SKILL.md"
    content = skill_path.read_text(encoding='utf-8')
    return extract_yaml_frontmatter(content)


def load_skill_meta(skill_folder: str) -> dict:
    """Load and parse _meta.json"""
    meta_path = SKILLS_DIR / skill_folder / "_meta.json"
    return json.loads(meta_path.read_text(encoding='utf-8'))


class TestSkillFilesExist:
    """Test that required files exist for each skill."""

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_skill_md_exists(self, skill_folder: str):
        """SKILL.md must exist for each skill."""
        skill_path = SKILLS_DIR / skill_folder / "SKILL.md"
        assert skill_path.exists(), f"SKILL.md missing for skill: {skill_folder}"

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_meta_json_exists(self, skill_folder: str):
        """_meta.json must exist for each skill."""
        meta_path = SKILLS_DIR / skill_folder / "_meta.json"
        assert meta_path.exists(), f"_meta.json missing for skill: {skill_folder}"


class TestFrontmatterParsing:
    """Test that frontmatter is parseable YAML."""

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_frontmatter_parseable(self, skill_folder: str):
        """Frontmatter must be parseable YAML."""
        try:
            frontmatter = load_skill_frontmatter(skill_folder)
            assert frontmatter is not None
        except Exception as e:
            pytest.fail(f"Failed to parse frontmatter for {skill_folder}: {e}")

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_frontmatter_has_name(self, skill_folder: str):
        """Frontmatter must have a non-empty 'name' field."""
        frontmatter = load_skill_frontmatter(skill_folder)
        assert 'name' in frontmatter, f"Missing 'name' field in frontmatter for {skill_folder}"
        assert frontmatter['name'], f"Empty 'name' field in frontmatter for {skill_folder}"

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_frontmatter_has_description(self, skill_folder: str):
        """Frontmatter must have a non-empty 'description' field."""
        frontmatter = load_skill_frontmatter(skill_folder)
        assert 'description' in frontmatter, f"Missing 'description' field in frontmatter for {skill_folder}"
        assert frontmatter['description'], f"Empty 'description' field in frontmatter for {skill_folder}"


class TestMetaJsonSchema:
    """Test that _meta.json has required fields."""

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_meta_has_owner_id(self, skill_folder: str):
        """_meta.json must have 'ownerId' field."""
        meta = load_skill_meta(skill_folder)
        assert 'ownerId' in meta, f"Missing 'ownerId' in _meta.json for {skill_folder}"
        assert meta['ownerId'], f"Empty 'ownerId' in _meta.json for {skill_folder}"

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_meta_has_slug(self, skill_folder: str):
        """_meta.json must have 'slug' field."""
        meta = load_skill_meta(skill_folder)
        assert 'slug' in meta, f"Missing 'slug' in _meta.json for {skill_folder}"
        assert meta['slug'], f"Empty 'slug' in _meta.json for {skill_folder}"

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_meta_has_version(self, skill_folder: str):
        """_meta.json must have 'version' field."""
        meta = load_skill_meta(skill_folder)
        assert 'version' in meta, f"Missing 'version' in _meta.json for {skill_folder}"
        assert meta['version'], f"Empty 'version' in _meta.json for {skill_folder}"

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_meta_has_published_at(self, skill_folder: str):
        """_meta.json must have 'publishedAt' field."""
        meta = load_skill_meta(skill_folder)
        assert 'publishedAt' in meta, f"Missing 'publishedAt' in _meta.json for {skill_folder}"
        # publishedAt should be a positive integer (timestamp)
        assert isinstance(meta['publishedAt'], int), f"'publishedAt' must be integer for {skill_folder}"
        assert meta['publishedAt'] > 0, f"'publishedAt' must be positive for {skill_folder}"


class TestFolderMetaSlugConsistency:
    """
    Test that folder name, frontmatter name, and _meta.json slug are consistent.
    
    Policy: frontmatter name MUST exactly equal folder name AND _meta.json.slug
    
    Known anomalies that will fail this test:
    - crypto-market-data: frontmatter name is "Crypto & Stock Market Data (Node.js)"
    - self-improving-agent: frontmatter name is "self-improvement"
    """

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_folder_equals_meta_slug(self, skill_folder: str):
        """Folder name must equal _meta.json slug."""
        meta = load_skill_meta(skill_folder)
        assert meta['slug'] == skill_folder, (
            f"Folder name '{skill_folder}' does not match _meta.json slug '{meta['slug']}'"
        )

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_frontmatter_name_equals_folder(self, skill_folder: str):
        """
        Frontmatter name must exactly equal folder name.
        
        This is a strict policy: frontmatter name MUST exactly equal folder name.
        This test will FAIL for:
        - crypto-market-data (name is "Crypto & Stock Market Data (Node.js)")
        - self-improving-agent (name is "self-improvement")
        """
        frontmatter = load_skill_frontmatter(skill_folder)
        frontmatter_name = frontmatter['name']
        
        assert frontmatter_name == skill_folder, (
            f"Frontmatter name '{frontmatter_name}' does not match folder name '{skill_folder}'. "
            f"Policy violation: frontmatter name MUST exactly equal folder name."
        )

    @pytest.mark.parametrize("skill_folder", ALL_SKILLS)
    def test_frontmatter_name_equals_meta_slug(self, skill_folder: str):
        """
        Frontmatter name must exactly equal _meta.json slug.
        
        This is a strict policy: frontmatter name MUST exactly equal _meta.json.slug
        This test will FAIL for:
        - crypto-market-data (name is "Crypto & Stock Market Data (Node.js)")
        - self-improving-agent (name is "self-improvement")
        """
        frontmatter = load_skill_frontmatter(skill_folder)
        meta = load_skill_meta(skill_folder)
        
        frontmatter_name = frontmatter['name']
        meta_slug = meta['slug']
        
        assert frontmatter_name == meta_slug, (
            f"Frontmatter name '{frontmatter_name}' does not match _meta.json slug '{meta_slug}'. "
            f"Policy violation: frontmatter name MUST exactly equal _meta.json.slug."
        )


class TestKnownAnomalies:
    """
    Explicit tests for known anomalies.
    
    These tests document the expected failures and provide clear diagnostic messages.
    """

    def test_crypto_market_data_anomaly(self):
        """
        Known anomaly: crypto-market-data has name "Crypto & Stock Market Data (Node.js)"
        but folder is "crypto-market-data".
        """
        frontmatter = load_skill_frontmatter("crypto-market-data")
        meta = load_skill_meta("crypto-market-data")
        
        # This will fail - documenting the anomaly
        assert frontmatter['name'] == "crypto-market-data", (
            f"ANOMALY: crypto-market-data frontmatter name is '{frontmatter['name']}' "
            f"but folder is 'crypto-market-data' and meta slug is '{meta['slug']}'"
        )

    def test_self_improving_agent_anomaly(self):
        """
        Known anomaly: self-improving-agent has name "self-improvement"
        but folder is "self-improving-agent".
        """
        frontmatter = load_skill_frontmatter("self-improving-agent")
        meta = load_skill_meta("self-improving-agent")
        
        # This will fail - documenting the anomaly
        assert frontmatter['name'] == "self-improving-agent", (
            f"ANOMALY: self-improving-agent frontmatter name is '{frontmatter['name']}' "
            f"but folder is 'self-improving-agent' and meta slug is '{meta['slug']}'"
        )


class TestSkillPackagingSummary:
    """Summary test that provides an overview of all skills."""

    def test_all_skills_count(self):
        """Verify we have exactly 14 skills."""
        skill_folders = [d.name for d in SKILLS_DIR.iterdir() if d.is_dir()]
        assert len(skill_folders) == 14, f"Expected 14 skills, found {len(skill_folders)}"

    def test_skills_list_matches_directory(self):
        """Verify ALL_SKILLS list matches actual skill directories."""
        skill_folders = sorted([d.name for d in SKILLS_DIR.iterdir() if d.is_dir()])
        assert sorted(ALL_SKILLS) == skill_folders, (
            f"ALL_SKILLS list doesn't match actual directories.\n"
            f"Expected: {sorted(ALL_SKILLS)}\n"
            f"Found: {skill_folders}"
        )
