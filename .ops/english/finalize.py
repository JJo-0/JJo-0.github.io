from pathlib import Path
import re
app=Path('spaceship-ui')
p=app/'site/content/about/index-en.md'
p.write_text(re.sub(r' {2,}\n','<br />\n',p.read_text()))
