from pathlib import Path
p=Path('spaceship-ui/scripts/browser-ezekiel-audit.mjs');s=p.read_text()
a="async function key(key,code=key){\n  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,...(key==='Enter'?{text:'\\r',windowsVirtualKeyCode:13}:{})},sessionId);\n  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key,code},sessionId);\n}"
b="async function key(key,code=key){\n  const virtualCodes={Enter:13,Backspace:8,End:35,Home:36,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Tab:9,Escape:27};\n  const windowsVirtualKeyCode=virtualCodes[key];\n  await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode,...(key==='Enter'?{text:'\\r'}:{})},sessionId);\n  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode},sessionId);\n}"
assert s.count(a)==1;p.write_text(s.replace(a,b))
print('Browser driver supplies Backspace/End virtual keys; all input actions and success assertions retained.')
