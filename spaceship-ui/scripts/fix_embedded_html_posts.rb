#!/usr/bin/env ruby
# frozen_string_literal: true

require 'fileutils'
require 'zlib'

TARGET_FILES = [
  'site/content/posts/2025-05-20-지속적인_보통_수준의_카페인_섭취.md',
  'site/content/posts/2025-05-23-Deep_Search_gemini.md',
  'site/content/posts/2025-05-23-Deep_Search_travel_prompt.md',
  'site/content/posts/2025-06-27-맞춤_마그네슘_영양제_선택.md',
  'site/content/posts/2025-07-23-맞춤_비타민B_영양제_선택.md',
  'site/content/posts/2025-07-23-맞춤_오메가3_영양제_선택.md',
  'site/content/posts/2025-08-06-당뇨병_통합관리.md'
].freeze

WRAPPER_TAG_PATTERN = %r{^</?(?:html|head|body)(?:\s[^>]*)?>$}i.freeze
DOCTYPE_PATTERN = /^<!doctype html>$/i.freeze
EXTRACTED_SCRIPT_DIR = 'site/assets/post-scripts'

def split_frontmatter(lines)
  return [[], lines] unless lines[0]&.strip == '---'

  end_idx = nil
  lines[1..].each_with_index do |line, idx|
    if line.strip == '---'
      end_idx = idx + 1
      break
    end
  end

  return [[], lines] unless end_idx

  [lines[0..end_idx], lines[(end_idx + 1)..] || []]
end

def normalize_body_lines(lines)
  inside_raw_block = false
  normalized = []

  lines.each do |line|
    stripped = line.strip

    next if stripped.match?(WRAPPER_TAG_PATTERN) || stripped.match?(DOCTYPE_PATTERN)

    if stripped.start_with?('<script', '<style')
      inside_raw_block = true
      normalized << line
      next
    end

    if stripped.start_with?('</script>', '</style>')
      inside_raw_block = false
      normalized << line
      next
    end

    if inside_raw_block
      normalized << line
      next
    end

    dedented = line.gsub(/^(?: {4})+/, '')
    normalized << dedented
  end

  normalized
end

def patch_diabetes_script(content)
  content
    .gsub("const navItems = document.querySelectorAll('.nav-item');",
          "const navItems = document.querySelectorAll('.nav-link');")
    .gsub("item.addEventListener('click', function() {",
          "item.addEventListener('click', function(event) {")
    .gsub("const target = this.getAttribute('data-target');",
          "event.preventDefault();\n            const target = (this.getAttribute('href') || '').replace('#', '');\n            if (!target) return;")
    .gsub("    // Set initial active state\n    navItems[0].classList.add('bg-emerald-100', 'border-emerald-400', 'text-emerald-800');",
          "    // Set initial active state\n    if (navItems.length > 0) {\n        navItems[0].classList.add('bg-emerald-100', 'border-emerald-400', 'text-emerald-800');\n    }\n    const firstSection = document.getElementById('dashboard');\n    if (firstSection) {\n        firstSection.classList.add('active');\n    }")
end

def extracted_script_filename(relative_path, index)
  basename = File.basename(relative_path, '.md')
  safe = basename.downcase.gsub(/[^0-9a-z]+/, '-').gsub(/^-|-$/, '')
  safe = 'post' if safe.empty?
  hash = Zlib.crc32(basename).to_s(16)
  "#{safe}-#{hash}-#{index}.js"
end

def extract_inline_scripts(relative_path, content)
  lines = content.lines
  output = []
  i = 0
  inline_script_index = 0

  while i < lines.length
    line = lines[i]

    opening_script = line.match(/^\s*<script(?:\s+[^>]*?)?>\s*$/i)
    has_src = line.match?(/\bsrc\s*=/i)

    unless opening_script && !has_src
      output << line
      i += 1
      next
    end

    script_lines = []
    i += 1
    while i < lines.length && !lines[i].match?(/^\s*<\/script>\s*$/i)
      script_lines << lines[i]
      i += 1
    end

    if i >= lines.length
      output << line
      output.concat(script_lines)
      break
    end

    inline_script_index += 1
    filename = extracted_script_filename(relative_path, inline_script_index)
    output_path = File.expand_path(File.join(EXTRACTED_SCRIPT_DIR, filename), Dir.pwd)
    File.write(output_path, script_lines.join, mode: 'w', encoding: 'UTF-8')

    output << %(<script src="/assets/post-scripts/#{filename}"></script>\n)
    i += 1
  end

  output.join
end

FileUtils.mkdir_p(File.expand_path(EXTRACTED_SCRIPT_DIR, Dir.pwd))

TARGET_FILES.each do |relative_path|
  path = File.expand_path(relative_path, Dir.pwd)
  lines = File.read(path, encoding: 'UTF-8').lines
  frontmatter, body = split_frontmatter(lines)
  normalized_body = normalize_body_lines(body)
  content = (frontmatter + normalized_body).join

  if relative_path.end_with?('2025-08-06-당뇨병_통합관리.md')
    content = patch_diabetes_script(content)
  end

  if relative_path.end_with?('2025-05-23-Deep_Search_travel_prompt.md')
    content = content.gsub(
      'description: "{% include tailwind_cdn.html %}..."',
      'description: Gemini Deep Research를 활용한 여행 프롬프트 엔지니어링 가이드'
    )
  end

  # Keep a single AdSense key across all imported posts.
  content = content.gsub('ca-pub-8376690444358767', 'ca-pub-7495843758830919')

  # Astro markdown escapes inline scripts in content; move them into static JS files.
  content = extract_inline_scripts(relative_path, content)

  File.write(path, content, mode: 'w', encoding: 'UTF-8')
  puts "updated: #{relative_path}"
end
