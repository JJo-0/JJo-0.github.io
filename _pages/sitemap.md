---
layout: archive
title: "사이트맵"
permalink: /sitemap/
author_profile: true
---

## 게시물

{% assign posts_by_year = site.posts | group_by_exp:"post", "post.date | date: '%Y'" %}
{% for year_group in posts_by_year reversed %}
  ### {{ year_group.name }}년
  <ul>
    {% for post in year_group.items reversed %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> - {{ post.date | date: "%Y년 %m월 %d일" }}</li>
    {% endfor %}
  </ul>
{% endfor %}

## 페이지

<ul>
  {% for p in site.pages %}
    {% if p.title and p.url and p.layout != nil and p.layout != 'none' and p.url != page.url and p.url != '/404.html' and p.url != '/feed.xml' %}
      {% unless p.url contains '/assets/' or p.url contains 'README' or p.url contains '.json' or p.url contains '.js' or p.url contains '.css' or p.url contains '.xml' %}
        <li><a href="{{ p.url | relative_url }}">{{ p.title }}</a></li>
      {% endunless %}
    {% endif %}
  {% endfor %}
  {% comment %} Include main navigation items that might not be in site.pages directly {% endcomment %}
  {% for item in site.data.navigation.main %}
    {% if item.url and item.title != "🏡" and item.url != "/sitemap/" %}
        {% assign item_is_page = false %}
        {% for p in site.pages %}
            {% if p.url == item.url %}
                {% assign item_is_page = true %}
                {% break %}
            {% endif %}
        {% endfor %}
        {% unless item_is_page %}
            <li><a href="{{ item.url | relative_url }}">{{ item.title }}</a></li>
        {% endunless %}
    {% endif %}
  {% endfor %}
</ul>
