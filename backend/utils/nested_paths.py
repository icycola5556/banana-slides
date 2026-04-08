from typing import Any


def is_index_segment(segment: str) -> bool:
    return segment.isdigit()


def set_nested_path(obj: dict[str, Any], path: str, value: Any) -> None:
    """Set nested dict/list paths like `items.0.image_src` without corrupting arrays."""
    parts = [part for part in path.split(".") if part]
    if not parts:
        raise ValueError("path cannot be empty")

    current: Any = obj
    for idx, part in enumerate(parts[:-1]):
        next_part = parts[idx + 1]
        expect_list = is_index_segment(next_part)

        if isinstance(current, list):
            if not is_index_segment(part):
                raise ValueError(f"Invalid list index segment: {part}")
            list_index = int(part)
            while len(current) <= list_index:
                current.append(None)

            child = current[list_index]
            if expect_list:
                if not isinstance(child, list):
                    child = []
                    current[list_index] = child
            else:
                if not isinstance(child, dict):
                    child = {}
                    current[list_index] = child
            current = child
            continue

        child = current.get(part)
        if expect_list:
            if not isinstance(child, list):
                child = []
                current[part] = child
        else:
            if not isinstance(child, dict):
                child = {}
                current[part] = child
        current = child

    last = parts[-1]
    if isinstance(current, list):
        if not is_index_segment(last):
            raise ValueError(f"Invalid list index segment: {last}")
        list_index = int(last)
        while len(current) <= list_index:
            current.append(None)
        current[list_index] = value
        return

    current[last] = value
