"""Fixture utilities package exports."""

from .mapper import resolve_attrs
from .patch import FixtureInstance, load_patch
from .profiles import ChannelDef, Profile, load_profiles

__all__ = [
    "ChannelDef",
    "FixtureInstance",
    "Profile",
    "load_patch",
    "load_profiles",
    "resolve_attrs",
]
