#!/usr/bin/env ruby
# frozen_string_literal: true

require 'optparse'
require 'pathname'

ROOT = Pathname(__dir__).join('..').expand_path
POSTS_DIR = ROOT.join('site/content/posts')

options = {
  write: false,
  min_length: 60,
  aggressive: false
}

OptionParser.new do |opts|
  opts.banner = 'Usage: ruby scripts/fix_post_descriptions.rb [options]'

  opts.on('--write', 'Apply changes to files') do
    options[:write] = true
  end

  opts.on('--min-length N', Integer, 'Minimum preferred description length (default: 60)') do |n|
    options[:min_length] = n
  end

  opts.on('--aggressive', 'Also fix descriptions shorter than --min-length') do
    options[:aggressive] = true
  end
end.parse!

def placeholder_description?(description)
  desc = description.to_s.strip
  return true if desc.empty?
  return true if desc.length <= 12
  return true if desc.match?(/\A(?:\.{2,}|-+\.{0,}|`.*`)\z/)
  return true if desc.start_with?('|') || desc.start_with?('* ') || desc.start_with?('---')

  false
end

def needs_fix?(description, min_length, aggressive)
  return true if placeholder_description?(description)
  return true if aggressive && description.to_s.strip.length < min_length

  false
end

def normalize_line(text)
  line = text.dup
  line.gsub!(/\[([^\]]+)\]\([^)]+\)/, '\1')
  line.gsub!(/`[^`]+`/, ' ')
  line.gsub!(/[*_>#]/, ' ')
  line.gsub!(/\|/, ' ')
  line.gsub!(/\s+/, ' ')
  line.strip
end

def extract_candidate_sentence(body)
  text = body.dup
  text.gsub!(/<script\b[^>]*>.*?<\/script>/mi, "\n")
  text.gsub!(/<style\b[^>]*>.*?<\/style>/mi, "\n")
  text.gsub!(/```.*?```/m, "\n")
  text.gsub!(/<\/?(?:p|div|section|article|header|main|li|h[1-6]|br)[^>]*>/i, "\n")
  text.gsub!(/<\/?[^>]+>/, ' ')

  lines = text.split("\n").map { |line| normalize_line(line) }
  lines.each do |line|
    next if line.empty?
    next if line.length < 25
    next if line.match?(/\A(?:목차|table of contents|contents|start|바로가기)\z/i)
    next if line.match?(/\A[0-9.: -]+\z/)
    next if line.count('A-Za-z가-힣') < 12

    return line
  end

  fallback = normalize_line(text.gsub(/\s+/, ' '))
  return nil if fallback.empty?

  fallback[0, 170]
end

def trim_description(description)
  return nil if description.nil?

  text = description.gsub(/\s+/, ' ').strip
  return nil if text.length < 25

  if text.length > 170
    cutoff = text.rindex(' ', 160) || 160
    text = text[0...cutoff].strip
  end

  text
end

def yaml_escape(text)
  text.gsub('\\', '\\\\').gsub('"', '\"')
end

changed = []

POSTS_DIR.children.select { |p| p.file? && p.extname == '.md' }.sort.each do |path|
  content = path.read
  fm_match = content.match(/\A---\n(.*?)\n---\n/m)
  next unless fm_match

  frontmatter = fm_match[1]
  body = content[(fm_match[0].length)..] || ''

  desc_line = frontmatter.lines.find { |line| line.start_with?('description:') }
  next unless desc_line

  current_description = desc_line.sub('description:', '').strip
  current_description = current_description.gsub(/\A["']|["']\z/, '')
  next unless needs_fix?(current_description, options[:min_length], options[:aggressive])

  candidate_text = extract_candidate_sentence(body)
  new_description = trim_description(candidate_text)
  next unless new_description
  next if new_description == current_description

  escaped = yaml_escape(new_description)
  new_frontmatter = frontmatter.sub(/^description:.*$/, %(description: "#{escaped}"))
  new_content = +"---\n#{new_frontmatter}\n---\n#{body}"

  changed << {
    file: path.relative_path_from(ROOT).to_s,
    from: current_description,
    to: new_description
  }

  path.write(new_content) if options[:write]
end

puts "description fix candidates: #{changed.length}"
changed.each do |item|
  puts "- #{item[:file]}"
  puts "  from: #{item[:from][0, 80]}"
  puts "  to:   #{item[:to][0, 100]}"
end

puts(options[:write] ? 'applied changes.' : 'dry-run only. use --write to apply.')
