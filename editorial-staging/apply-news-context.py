import hashlib
import pathlib

root=pathlib.Path('release')
patches={
 'spaceship-ui/src/components/Header.astro':(
  '87e380ace5cd6b89413a5e063b8a9f8ca82d8af3d45a86c9a659464957c738a0',[
   ('  englishPath?: string;\n','  englishPath?: string;\n  activeSection?: \'news\' | \'writing\';\n'),
   ('const { pageLang = SITE.lang, englishPath } = Astro.props;','const { pageLang = SITE.lang, englishPath, activeSection } = Astro.props;'),
   ('const isActive = (href: string) => {\n','const isActive = (href: string) => {\n  if (activeSection) return href === (activeSection === \'news\' ? \'/news\' : \'/posts\');\n')]),
 'spaceship-ui/src/layouts/Layout.astro':(
  'f1ed3cff623c0795ba6b425b8a38358aacbb90fe71ee252770ccb63efebafbf4',[
   ('  languageAlternates?: Record<string, string>;\n','  languageAlternates?: Record<string, string>;\n  activeSection?: \'news\' | \'writing\';\n'),
   ('  languageAlternates = {},\n','  languageAlternates = {},\n  activeSection,\n'),
   ('<Header pageLang={pageLang} {englishPath} />','<Header pageLang={pageLang} {englishPath} {activeSection} />')]),
 'spaceship-ui/src/pages/posts/[...slug]/index.astro':(
  'f4bcb14239e45f161101e7a52cf91c404c3923daa74bb22b3a679a2ca88df9f1',[
   ('  languageAlternates={languageAlternates}\n','  languageAlternates={languageAlternates}\n  activeSection={isNewsPost ? \'news\' : \'writing\'}\n')])
}
for name,(expected,replacements) in patches.items():
 path=root/name
 assert hashlib.sha256(path.read_bytes()).hexdigest()==expected,('Base conflict',name)
 text=path.read_text()
 for before,after in replacements:
  assert text.count(before)==1,(name,before,text.count(before))
  text=text.replace(before,after,1)
 path.write_text(text,encoding='utf8')
print('Passed authoritative article section to Header; non-article route fallback preserved.')
