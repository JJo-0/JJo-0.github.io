#!/usr/bin/env ruby
# frozen_string_literal: true

require 'date'
require 'fileutils'
require 'optparse'
require 'pathname'
require 'time'
require 'yaml'

ROOT = Pathname(__dir__).join('..').expand_path
POSTS_DIR = ROOT.join('site/content/posts')

options = {
  check: false,
  report: ROOT.join('reports/seo-audit.md'),
  no_report: false
}

OptionParser.new do |opts|
  opts.banner = 'Usage: ruby scripts/seo_audit.rb [options]'

  opts.on('--check', 'Exit with code 1 when critical issues exist') do
    options[:check] = true
  end

  opts.on('--report PATH', 'Write markdown report to PATH') do |path|
    options[:report] = Pathname(path)
  end

  opts.on('--no-report', 'Skip report file generation') do
    options[:no_report] = true
  end
end.parse!

def read_frontmatter(path)
  content = path.read
  match = content.match(/\A---\n(.*?)\n---\n/m)
  return [nil, content] unless match

  frontmatter = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
  [frontmatter, content]
rescue StandardError
  [nil, content]
end

def slug_from_path(path)
  path.basename('.md').to_s
end

def looks_kebab_case?(value)
  value.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/)
end

def looks_korean?(value)
  value.match?(/[가-힣]/)
end

today = Date.today
rows = []

POSTS_DIR.children.select { |p| p.file? && p.extname == '.md' }.sort.each do |post_path|
  frontmatter, raw = read_frontmatter(post_path)
  next unless frontmatter

  title = frontmatter['title'].to_s.strip
  description = frontmatter['description'].to_s.strip
  tags = Array(frontmatter['tags']).map(&:to_s).map(&:strip).reject(&:empty?)
  pub_date = frontmatter['pubDate']
  updated_date = frontmatter['updatedDate']
  canonical_url = frontmatter['canonicalURL']
  draft = !!frontmatter['draft']

  rows << {
    file: post_path.relative_path_from(ROOT).to_s,
    slug: slug_from_path(post_path),
    title: title,
    description: description,
    tags: tags,
    pub_date: pub_date,
    updated_date: updated_date,
    canonical_url: canonical_url,
    draft: draft,
    raw: raw
  }
end

errors = []
warnings = []
infos = []

title_counts = Hash.new(0)
tag_counts = Hash.new(0)

rows.each do |row|
  title_counts[row[:title]] += 1 unless row[:title].empty?
  row[:tags].each { |tag| tag_counts[tag] += 1 }
end

rows.each do |row|
  file = row[:file]

  if row[:title].empty?
    errors << "#{file}: missing title"
  elsif row[:title].length < 8
    warnings << "#{file}: short title (#{row[:title].length} chars)"
  end

  if row[:description].empty?
    errors << "#{file}: missing description"
  elsif row[:description].length < 60 || row[:description].length > 180
    warnings << "#{file}: description length #{row[:description].length} (recommended 60-180)"
  end

  if row[:tags].empty?
    errors << "#{file}: missing tags"
  elsif row[:tags].length > 8
    warnings << "#{file}: many tags (#{row[:tags].length})"
  end

  if row[:pub_date].nil?
    errors << "#{file}: missing pubDate"
  else
    begin
      date = Date.parse(row[:pub_date].to_s)
      warnings << "#{file}: future pubDate #{date}" if date > today && !row[:draft]
    rescue StandardError
      errors << "#{file}: invalid pubDate format #{row[:pub_date].inspect}"
    end
  end

  unless row[:canonical_url].nil? || row[:canonical_url].to_s.empty?
    unless row[:canonical_url].to_s.match?(%r{\Ahttps?://})
      warnings << "#{file}: canonicalURL should be absolute URL"
    end
  end

  if row[:raw].include?('cdn.tailwindcss.com') && !row[:tags].include?('interactive-ui')
    warnings << "#{file}: includes tailwind CDN script in post body"
  end

  row[:tags].each do |tag|
    next if looks_kebab_case?(tag) || looks_korean?(tag)

    warnings << "#{file}: non-standard tag format '#{tag}'"
  end
end

title_counts.each do |title, count|
  next if count <= 1

  warnings << "duplicate title: '#{title}' (#{count} posts)"
end

single_use_tags = tag_counts.select { |_tag, count| count == 1 }.keys.sort
top_tags = tag_counts.sort_by { |tag, count| [-count, tag] }.first(20)

report_lines = []
report_lines << '# SEO Audit Report'
report_lines << ''
report_lines << "- Generated at: #{Time.now.utc.iso8601}"
report_lines << "- Total posts: #{rows.length}"
report_lines << "- Unique tags: #{tag_counts.length}"
report_lines << "- Errors: #{errors.length}"
report_lines << "- Warnings: #{warnings.length}"
report_lines << ''
report_lines << '## Critical Issues'
report_lines << ''
if errors.empty?
  report_lines << '- None'
else
  errors.each { |line| report_lines << "- #{line}" }
end
report_lines << ''
report_lines << '## Warnings'
report_lines << ''
if warnings.empty?
  report_lines << '- None'
else
  warnings.each { |line| report_lines << "- #{line}" }
end
report_lines << ''
report_lines << '## Top Tags'
report_lines << ''
top_tags.each do |tag, count|
  report_lines << "- #{tag}: #{count}"
end
report_lines << ''
report_lines << '## Single-use Tags (Review Candidates)'
report_lines << ''
if single_use_tags.empty?
  report_lines << '- None'
else
  single_use_tags.each { |tag| report_lines << "- #{tag}" }
end

unless options[:no_report]
  report_path = options[:report]
  report_path = ROOT.join(report_path) unless report_path.absolute?
  FileUtils.mkdir_p(report_path.dirname)
  report_path.write(report_lines.join("\n") + "\n")
  infos << "report written: #{report_path.relative_path_from(ROOT)}"
end

puts "SEO audit complete - posts: #{rows.length}, tags: #{tag_counts.length}, errors: #{errors.length}, warnings: #{warnings.length}"
infos.each { |line| puts line }

if options[:check] && !errors.empty?
  warn 'check failed: critical SEO issues found'
  exit 1
end
