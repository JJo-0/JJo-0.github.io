#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'
require 'date'
require 'fileutils'

ROOT = File.expand_path('..', __dir__)
SOURCE_ROOT = File.expand_path('../', ROOT)
SOURCE_POSTS = File.join(SOURCE_ROOT, '_posts')
TARGET_POSTS = File.join(ROOT, 'site', 'content', 'posts')
TARGET_ASSETS = File.join(ROOT, 'site', 'assets')

def parse_frontmatter(content)
  lines = content.lines
  start_idx = lines.index { |line| line.strip == '---' }
  return [{}, content] unless start_idx

  end_idx = nil
  (start_idx + 1...lines.length).each do |i|
    if lines[i].strip == '---'
      end_idx = i
      break
    end
  end
  return [{}, content] unless end_idx

  frontmatter = lines[(start_idx + 1)...end_idx].join
  body = lines[(end_idx + 1)..].join || ''
  data = YAML.safe_load(frontmatter, permitted_classes: [Date, Time], aliases: true)
  [data.is_a?(Hash) ? data : {}, body]
end

def strip_html(text)
  text.to_s.gsub(/<[^>]*>/, ' ')
end

def compact_whitespace(text)
  text.to_s.gsub(/\s+/, ' ').strip
end

def fallback_description(body)
  body.to_s.each_line do |line|
    s = line.strip
    next if s.empty?
    next if s.match?(/\A[=\-_*]+\z/)
    next if s.start_with?('#', '```', '<script', '</script', '<style', '</style', '<!--')
    next if s.start_with?('---')

    cleaned = compact_whitespace(strip_html(s))
    next if cleaned.empty?
    next if cleaned.length < 4

    return cleaned[0, 220]
  end
  'Post summary will be updated soon.'
end

def parse_date(filename, frontmatter)
  if frontmatter['date'].is_a?(Date)
    return frontmatter['date']
  end
  if frontmatter['date'].is_a?(Time)
    return frontmatter['date'].to_date
  end
  if frontmatter['date'].is_a?(String)
    begin
      return Date.parse(frontmatter['date'])
    rescue StandardError
      # ignore and fallback to filename
    end
  end

  if (match = filename.match(/^(\d{4}-\d{2}-\d{2})-/))
    return Date.parse(match[1])
  end

  Date.today
end

def derive_title(filename, frontmatter)
  title = frontmatter['title'].to_s.strip
  return title unless title.empty?

  stem = File.basename(filename, File.extname(filename))
  stem = stem.sub(/^\d{4}-\d{2}-\d{2}-/, '')
  stem.tr('_', ' ').strip
end

def derive_tags(frontmatter)
  tags = []
  %w[tags tag].each do |key|
    value = frontmatter[key]
    case value
    when Array
      tags.concat(value)
    when String
      tags << value
    end
  end

  tags = tags.map { |t| t.to_s.strip }.reject(&:empty?)
  tags = tags.uniq

  if tags.empty?
    categories = frontmatter['categories']
    categories = [categories] if categories.is_a?(String)
    if categories.is_a?(Array)
      categories.each do |category|
        c = category.to_s.strip
        tags << c unless c.empty?
      end
    end
  end

  tags = tags.first(6)
  tags = tags + ['study-notes'] while tags.length < 3
  tags.uniq.first(6)
end

def build_frontmatter(title, description, pub_date, tags)
  data = {
    'title' => title,
    'description' => description,
    'pubDate' => pub_date,
    'tags' => tags
  }
  yaml = data.to_yaml(line_width: -1).sub(/\A---\s*\n/, '')
  "---\n#{yaml}---\n"
end

def migrate_posts
  FileUtils.rm_rf(TARGET_POSTS)
  FileUtils.mkdir_p(TARGET_POSTS)

  Dir.glob(File.join(SOURCE_POSTS, '*.md')).sort.each do |src_path|
    filename = File.basename(src_path)
    content = File.read(src_path, encoding: 'UTF-8')
    frontmatter, body = parse_frontmatter(content)

    title = derive_title(filename, frontmatter)
    description_raw = compact_whitespace(strip_html(frontmatter['excerpt']))
    description = description_raw.empty? ? fallback_description(body) : description_raw[0, 220]
    pub_date = parse_date(filename, frontmatter)
    tags = derive_tags(frontmatter)

    target_path = File.join(TARGET_POSTS, filename)
    migrated = build_frontmatter(title, description, pub_date, tags) + body
    File.write(target_path, migrated, mode: 'w', encoding: 'UTF-8')
  end
end

def copy_assets
  FileUtils.mkdir_p(TARGET_ASSETS)

  source_image = File.join(SOURCE_ROOT, 'image')
  target_image = File.join(TARGET_ASSETS, 'image')
  if Dir.exist?(source_image)
    FileUtils.rm_rf(target_image)
    FileUtils.cp_r(source_image, target_image)
  end

  source_assets = File.join(SOURCE_ROOT, 'assets')
  target_assets = File.join(TARGET_ASSETS, 'assets')
  if Dir.exist?(source_assets)
    FileUtils.rm_rf(target_assets)
    FileUtils.cp_r(source_assets, target_assets)
  end

  source_ads_txt = File.join(SOURCE_ROOT, 'ads.txt')
  target_ads_txt = File.join(TARGET_ASSETS, 'ads.txt')
  FileUtils.cp(source_ads_txt, target_ads_txt) if File.exist?(source_ads_txt)
end

migrate_posts
copy_assets

puts "migrated_posts=#{Dir.glob(File.join(TARGET_POSTS, '*.md')).size}"
puts "image_copied=#{Dir.exist?(File.join(TARGET_ASSETS, 'image'))}"
puts "assets_copied=#{Dir.exist?(File.join(TARGET_ASSETS, 'assets'))}"
