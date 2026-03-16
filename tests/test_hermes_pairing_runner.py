import pytest
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from server import (
    HERMES_PAIRING_PLATFORMS,
    PAIRING_CODE_RE,
    PAIRING_USER_ID_RE,
    _validate_pairing_platform,
    _validate_pairing_code,
    _validate_pairing_user_id,
)


class TestValidatePairingPlatform:
    def test_validate_pairing_platform_telegram(self):
        assert _validate_pairing_platform("telegram") == "telegram"

    def test_validate_pairing_platform_discord(self):
        assert _validate_pairing_platform("discord") == "discord"

    def test_validate_pairing_platform_slack(self):
        assert _validate_pairing_platform("slack") == "slack"

    def test_validate_pairing_platform_whatsapp(self):
        assert _validate_pairing_platform("whatsapp") == "whatsapp"

    def test_validate_pairing_platform_signal(self):
        assert _validate_pairing_platform("signal") == "signal"

    def test_validate_pairing_platform_email(self):
        assert _validate_pairing_platform("email") == "email"

    def test_validate_pairing_platform_homeassistant(self):
        assert _validate_pairing_platform("homeassistant") == "homeassistant"

    def test_invalid_platform(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_platform("invalid")
        assert "Invalid platform" in str(exc_info.value)

    def test_invalid_platform_empty(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_platform("")
        assert "Invalid platform" in str(exc_info.value)

    def test_invalid_platform_none(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_platform("telegram1")
        assert "Invalid platform" in str(exc_info.value)


class TestValidatePairingCode:
    def test_validate_pairing_code_all_uppercase(self):
        assert _validate_pairing_code("ABCDEFGH") == "ABCDEFGH"

    def test_validate_pairing_code_with_digits(self):
        assert _validate_pairing_code("A2CDEFGH") == "A2CDEFGH"

    def test_validate_pairing_code_all_digits(self):
        assert _validate_pairing_code("23456789") == "23456789"

    def test_invalid_code_too_short(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("ABCDEFG")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_too_long(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("ABCDEFGHI")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_lowercase(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("abcdefgh")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_with_special_chars(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("ABC!DEFG")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_with_0_or_1(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("A0CDEFGH")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_empty(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("")
        assert "Invalid pairing code" in str(exc_info.value)


class TestValidatePairingUserId:
    def test_validate_pairing_user_id_simple(self):
        assert _validate_pairing_user_id("user123") == "user123"

    def test_validate_pairing_user_id_with_underscore(self):
        assert _validate_pairing_user_id("user_123") == "user_123"

    def test_validate_pairing_user_id_with_at(self):
        assert _validate_pairing_user_id("user@example") == "user@example"

    def test_validate_pairing_user_id_with_plus(self):
        assert _validate_pairing_user_id("user+123") == "user+123"

    def test_validate_pairing_user_id_with_colon(self):
        assert _validate_pairing_user_id("user:123") == "user:123"

    def test_validate_pairing_user_id_with_dot(self):
        assert _validate_pairing_user_id("user.name") == "user.name"

    def test_validate_pairing_user_id_with_hyphen(self):
        assert _validate_pairing_user_id("user-name") == "user-name"

    def test_validate_pairing_user_id_max_length(self):
        max_length_id = "a" * 128
        assert _validate_pairing_user_id(max_length_id) == max_length_id

    def test_invalid_user_id_too_long(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("a" * 129)
        assert "Invalid user ID" in str(exc_info.value)

    def test_invalid_user_id_empty(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("")
        assert "Invalid user ID" in str(exc_info.value)

    def test_invalid_user_id_with_special_chars(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("user@#$")
        assert "Invalid user ID" in str(exc_info.value)

    def test_invalid_user_id_with_space(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("user id")
        assert "Invalid user ID" in str(exc_info.value)


class TestPairingConstants:
    def test_hermes_pairing_platforms_tuple(self):
        assert isinstance(HERMES_PAIRING_PLATFORMS, tuple)
        assert len(HERMES_PAIRING_PLATFORMS) == 7

    def test_pairing_code_regex_pattern(self):
        assert PAIRING_CODE_RE.pattern == r"^[A-Z2-9]{8}$"

    def test_pairing_user_id_regex_pattern(self):
        assert PAIRING_USER_ID_RE.pattern == r"^[A-Za-z0-9_:+@.-]{1,128}$"
