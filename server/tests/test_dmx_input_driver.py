from server.drivers.dmx_input import parse_sparkfun_line


def test_parse_valid_line() -> None:
    line = "DMX: read value from channel 12: 255"
    parsed = parse_sparkfun_line(line)
    assert parsed == (12, 255)


def test_parse_invalid_line() -> None:
    assert parse_sparkfun_line("hello world") is None
    assert parse_sparkfun_line("DMX: read value from channel -1: 50") is None
    assert parse_sparkfun_line("DMX: read value from channel 1: 999") is None
