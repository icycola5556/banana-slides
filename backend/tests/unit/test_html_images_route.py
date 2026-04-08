from utils.nested_paths import set_nested_path


def test_set_nested_path_preserves_array_slots():
    payload = {
        "items": [
            {"title": "案例一"},
            {"title": "案例二"},
        ]
    }

    set_nested_path(payload, "items.0.image_src", "/files/demo-1.webp")
    set_nested_path(payload, "items.1.image_src", "/files/demo-2.webp")

    assert isinstance(payload["items"], list)
    assert payload["items"][0]["title"] == "案例一"
    assert payload["items"][0]["image_src"] == "/files/demo-1.webp"
    assert payload["items"][1]["title"] == "案例二"
    assert payload["items"][1]["image_src"] == "/files/demo-2.webp"


def test_set_nested_path_creates_arrays_for_index_segments():
    payload = {}

    set_nested_path(payload, "items.1.image_src", "/files/demo-2.webp")

    assert isinstance(payload["items"], list)
    assert payload["items"][0] is None
    assert payload["items"][1]["image_src"] == "/files/demo-2.webp"
