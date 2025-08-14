---
layout: single
title: "📚 전체 카테고리"
permalink: /categories/
author_profile: true
classes: wide
---

<style>
    /* PARA Category Colors */
    :root {
        --project-color: #3B82F6;
        --area-color: #10B981;
        --resource-color: #8B5CF6;
        --archive-color: #6B7280;
        --card-bg: #ffffff;
        --card-border: #e5e7eb;
        --text-main: #1f2937;
        --text-secondary: #4b5563;
        --link-hover-bg: #f9fafb;
    }

    .page__content h1 {
        text-align: center;
        margin-bottom: 0.5em;
    }

    .category-intro {
        text-align: center;
        font-size: 1.1em;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto 2.5em auto;
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }

    .category-card {
        background-color: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .category-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }

    .card-header {
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border-bottom: 1px solid var(--card-border);
    }

    .card-header .icon {
        font-size: 2rem;
        line-height: 1;
    }

    .card-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-main);
    }

    /* Card Header Colors */
    #projects .card-header { background-color: rgba(59, 130, 246, 0.1); border-left: 5px solid var(--project-color); }
    #areas .card-header { background-color: rgba(16, 185, 129, 0.1); border-left: 5px solid var(--area-color); }
    #resources .card-header { background-color: rgba(139, 92, 246, 0.1); border-left: 5px solid var(--resource-color); }
    #archive .card-header { background-color: rgba(107, 114, 128, 0.1); border-left: 5px solid var(--archive-color); }

    .card-content {
        padding: 0;
    }

    .subcategory-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .subcategory-list li a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        text-decoration: none;
        color: var(--text-secondary);
        font-weight: 500;
        border-bottom: 1px solid var(--card-border);
        transition: background-color 0.2s ease, color 0.2s ease;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .post-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
    
    .post-title {
        flex: 1;
        font-weight: 600;
        color: var(--text-main);
        margin-right: 1rem;
        /* 제목 길이 제한 */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 300px;
    }
    
    .post-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        margin-top: 0.25rem;
        font-size: 0.75rem;
    }
    
    .post-tag {
        background-color: #f3f4f6;
        color: #6b7280;
        padding: 0.125rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .subcategory-list li a:hover .post-tag {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--project-color);
    }
    
    #areas .subcategory-list li a:hover .post-tag {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--area-color);
    }
    
    #resources .subcategory-list li a:hover .post-tag {
        background-color: rgba(139, 92, 246, 0.1);
        color: var(--resource-color);
    }
    
    #archive .subcategory-list li a:hover .post-tag {
        background-color: rgba(107, 114, 128, 0.1);
        color: var(--archive-color);
    }

    .subcategory-list li:last-child a {
        border-bottom: none;
    }

    .subcategory-list li a:hover {
        background-color: var(--link-hover-bg);
        color: var(--text-main);
    }

    .post-count {
        background-color: #e5e7eb;
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        transition: all 0.2s ease;
    }

    .post-date {
        background-color: #e5e7eb;
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        transition: all 0.2s ease;
    }

    .subcategory-list li a:hover .post-count,
    .subcategory-list li a:hover .post-date {
        background-color: var(--project-color);
        color: white;
    }

    #areas .subcategory-list li a:hover .post-count,
    #areas .subcategory-list li a:hover .post-date { 
        background-color: var(--area-color); 
    }
    
    #resources .subcategory-list li a:hover .post-count,
    #resources .subcategory-list li a:hover .post-date { 
        background-color: var(--resource-color); 
    }
    
    #archive .subcategory-list li a:hover .post-count,
    #archive .subcategory-list li a:hover .post-date { 
        background-color: var(--archive-color); 
    }

</style>

<p class="category-intro">
    PARA(Projects, Areas, Resources, Archives) 방법론에 따라 정리된 카테고리입니다. 관심 있는 주제를 클릭하여 관련 글들을 탐색해보세요.
</p>

<div class="category-grid">
    {% assign para_map = "Projects,Areas,Resources,Archive" | split: "," %}

    {% for para_category in para_map %}
        {% assign para_lower = para_category | downcase %}
        <article id="{{ para_lower }}" class="category-card">
            <div class="card-header">
                <span class="icon">
                    {% if para_category == 'Projects' %}🚀
                    {% elsif para_category == 'Areas' %}📚
                    {% elsif para_category == 'Resources' %}💡
                    {% else %}🗄️
                    {% endif %}
                </span>
                <h2>{{ para_category }}</h2>
            </div>
            <div class="card-content">
                <ul class="subcategory-list">
                    {% assign category_posts = "" | split: "" %}
                    {% for post in site.posts %}
                        {% if post.categories contains para_category %}
                            {% assign category_posts = category_posts | push: post %}
                        {% endif %}
                    {% endfor %}
                    
                    {% assign sorted_posts = category_posts | sort: "date" | reverse %}
                    {% for post in sorted_posts %}
                        <li>
                            <a href="{{ post.url | relative_url }}">
                                <div class="post-info">
                                    <span class="post-title" title="{{ post.title }}">
                                        {% assign title_length = post.title | size %}
                                        {% if title_length > 50 %}
                                            {{ post.title | truncate: 50 }}
                                        {% else %}
                                            {{ post.title }}
                                        {% endif %}
                                    </span>
                                    <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
                                </div>
                                {% if post.tags and post.tags.size > 0 %}
                                    <div class="post-tags">
                                        {% for tag in post.tags limit: 3 %}
                                            <span class="post-tag">#{{ tag }}</span>
                                        {% endfor %}
                                        {% if post.tags.size > 3 %}
                                            <span class="post-tag">+{{ post.tags.size | minus: 3 }}</span>
                                        {% endif %}
                                    </div>
                                {% endif %}
                            </a>
                        </li>
                    {% endfor %}
                </ul>
            </div>
        </article>
    {% endfor %}
</div>

<script>
    // para_mapping.yml 데이터가 필요합니다. _data/para_mapping.yml 파일을 생성해주세요.
    // 이 스크립트는 Jekyll 빌드 시 Liquid로 처리되므로, 클라이언트 사이드에서는 para_mapping 데이터가 필요 없습니다.
    // 하지만, 만약 JS로 동적 처리를 원한다면 이 데이터를 JSON으로 변환하여 전달해야 합니다.
</script>