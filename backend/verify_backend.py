import sys
import os

sys.path.append(os.getcwd())

try:
    from app.api import endpoints
    print("SUCCESS: app.api.endpoints imported cleanly.")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.auth import auth
    print("SUCCESS: app.auth.auth imported cleanly.")
except Exception as e:
    print(f"ERROR: {e}")
