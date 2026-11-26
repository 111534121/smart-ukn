"""Local memory-database preview with project-local PDF dependencies."""
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root))
if (root/'.preview-deps').is_dir():
    sys.path.insert(0,str(root/'.preview-deps'))
import app
app.get_db_connection=lambda:None
if __name__=='__main__':
    app.app.run(host='127.0.0.1',port=8014,debug=False)
