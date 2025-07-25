#!/usr/bin/env python3
"""
PARA 방법론 기반 블로그 포스트 카테고리 정리 스크립트
Projects, Areas, Resources, Archive 구조로 재분류
"""

import os
import re
import yaml
import glob
from pathlib import Path

# PARA 카테고리 매핑
PARA_MAPPING = {
    # Projects (현재 진행 중인 프로젝트)
    'computer_vision': ['Projects', 'Computer-Vision'],
    'ai_research': ['Projects', 'AI-Research'], 
    'web_development': ['Projects', 'Web-Development'],
    'robotics': ['Projects', 'Robotics'],
    
    # Areas (지속적인 관심 영역)
    'health_wellness': ['Areas', 'Health-Wellness'],
    'neuroscience': ['Areas', 'Neuroscience'],
    'programming': ['Areas', 'Programming'],
    'system_setup': ['Areas', 'System-Setup'],
    
    # Resources (참고 자료와 지식)
    'study_notes': ['Resources', 'Study-Notes'],
    'tools_guides': ['Resources', 'Tools-Guides'],
    'code_analysis': ['Resources', 'Code-Analysis'],
    'research_papers': ['Resources', 'Research-Papers'],
    
    # Archive (완료되거나 비활성 상태)
    'blog_setup': ['Archive', 'Blog-Setup'],
    'legacy_projects': ['Archive', 'Legacy-Projects'],
    'experiments': ['Archive', 'Experiments']
}

def classify_post(title, content, old_categories, old_tags):
    """포스트 내용을 분석하여 PARA 카테고리 분류"""
    
    title_lower = title.lower()
    content_lower = content.lower()
    
    # 키워드 기반 분류 로직
    
    # Computer Vision & AI
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['alphapose', 'pose', 'vision', '시각', 'opencv', 'ai', 'neural', '뉴럴']):
        return PARA_MAPPING['computer_vision']
    
    # Health & Wellness
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['비타민', 'vitamin', '오메가', 'omega', '건강', 'health', '영양', 'nutrition']):
        return PARA_MAPPING['health_wellness']
    
    # Neuroscience
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['뇌', 'brain', '신경', 'neuro', 'fmri', '시각신경']):
        return PARA_MAPPING['neuroscience']
    
    # Robotics
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['ros', 'robot', '로봇', 'slam']):
        return PARA_MAPPING['robotics']
    
    # Web Development
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['javascript', 'web', 'html', 'css', '게임', 'game']):
        return PARA_MAPPING['web_development']
    
    # Study Notes
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['자료구조', 'data structure', '정리', '공부', 'study', '코딩테스트']):
        return PARA_MAPPING['study_notes']
    
    # Tools & Guides
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['설치', 'install', 'setup', '환경', 'linux', 'docker']):
        return PARA_MAPPING['tools_guides']
    
    # Code Analysis
    if any(keyword in title_lower or keyword in content_lower for keyword in 
           ['분석', 'analysis', 'code', '코드']):
        return PARA_MAPPING['code_analysis']
    
    # Default to Study Notes if uncertain
    return PARA_MAPPING['study_notes']

def generate_tags(title, content, old_tags):
    """포스트 내용을 분석하여 적절한 태그 생성"""
    
    tags = set()
    title_lower = title.lower()
    content_lower = content.lower()
    
    # 기존 태그 중 유용한 것들 유지
    if old_tags:
        for tag in old_tags:
            if isinstance(tag, str) and len(tag) > 2:
                tags.add(tag.lower().replace(' ', '-'))
    
    # 기술 스택 태그
    tech_keywords = {
        'python': 'python',
        'javascript': 'javascript', 
        'c++': 'cpp',
        'linux': 'linux',
        'docker': 'docker',
        'ros': 'ros',
        'opencv': 'opencv'
    }
    
    for keyword, tag in tech_keywords.items():
        if keyword in title_lower or keyword in content_lower:
            tags.add(tag)
    
    # 주제별 태그
    topic_keywords = {
        'ai': 'artificial-intelligence',
        '머신러닝': 'machine-learning',
        '딥러닝': 'deep-learning',
        '건강': 'health',
        '영양': 'nutrition',
        '게임': 'game',
        '인터랙티브': 'interactive'
    }
    
    for keyword, tag in topic_keywords.items():
        if keyword in title_lower or keyword in content_lower:
            tags.add(tag)
    
    return list(tags)[:6]  # 최대 6개 태그

def update_frontmatter(file_path):
    """포스트의 front matter 업데이트"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Front matter 파싱
    if not content.startswith('---'):
        return False
    
    try:
        parts = content.split('---', 2)
        if len(parts) < 3:
            return False
        
        frontmatter = yaml.safe_load(parts[1])
        post_content = parts[2]
        
        title = frontmatter.get('title', '')
        old_categories = frontmatter.get('categories', [])
        old_tags = frontmatter.get('tags', [])
        
        # 새 카테고리 분류
        new_categories = classify_post(title, post_content, old_categories, old_tags)
        new_tags = generate_tags(title, post_content, old_tags)
        
        # Front matter 업데이트
        frontmatter['layout'] = 'single'
        frontmatter['categories'] = new_categories
        frontmatter['tag'] = new_tags
        
        if 'excerpt' not in frontmatter:
            # 간단한 excerpt 생성
            first_paragraph = re.search(r'\n\n([^#\n]+)', post_content)
            if first_paragraph:
                excerpt = first_paragraph.group(1).strip()[:100] + "..."
                frontmatter['excerpt'] = excerpt
        
        # 기본 설정 추가
        if 'toc' not in frontmatter:
            frontmatter['toc'] = True
        if 'toc_label' not in frontmatter:
            frontmatter['toc_label'] = "목차"
        if 'author_profile' not in frontmatter:
            frontmatter['author_profile'] = True
        
        # 새 내용 작성
        new_content = f"---\n{yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False)}---{post_content}"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated: {os.path.basename(file_path)}")
        print(f"   Categories: {new_categories}")
        print(f"   Tags: {new_tags}")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """메인 실행 함수"""
    
    posts_dir = "/Users/jo/projects/gitblog/_posts"
    post_files = glob.glob(f"{posts_dir}/*.md")
    
    print(f"🔍 Found {len(post_files)} posts to process")
    print("📁 PARA Category Structure:")
    print("   Projects: Computer-Vision, AI-Research, Web-Development, Robotics")
    print("   Areas: Health-Wellness, Neuroscience, Programming, System-Setup") 
    print("   Resources: Study-Notes, Tools-Guides, Code-Analysis, Research-Papers")
    print("   Archive: Blog-Setup, Legacy-Projects, Experiments")
    print()
    
    successful = 0
    failed = 0
    
    for post_file in sorted(post_files):
        if update_frontmatter(post_file):
            successful += 1
        else:
            failed += 1
    
    print(f"📊 Processing complete:")
    print(f"   ✅ Successful: {successful}")
    print(f"   ❌ Failed: {failed}")

if __name__ == "__main__":
    main()
