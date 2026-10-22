"""Production entrypoint. Persist only new runtime state; never copy local student data."""
import os
import shutil
from pathlib import Path


def prepare_runtime():
    root = Path(__file__).resolve().parent
    persistent = os.getenv('PERSISTENT_ROOT')
    if not persistent:
        return
    target = Path(persistent)
    locations = {
        'CAMPUS_DATA_DIR': target / 'campus',
        'UPLOAD_DIR': target / 'uploads',
        'FORMS_DIR': target / 'forms',
    }
    for key, path in locations.items():
        os.environ.setdefault(key, str(path))
        Path(os.environ[key]).mkdir(parents=True, exist_ok=True)
    for key, name in [('LINKS_FILE', 'links.json'), ('SCHOOL_CALENDAR_FILE', 'school_calendar.json')]:
        os.environ.setdefault(key, str(target / name))
        dest = Path(os.environ[key])
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            shutil.copyfile(root / name, dest)


prepare_runtime()
from app import app  # noqa: E402,F401
