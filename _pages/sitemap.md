---
layout: single
title: "🗺️ 사이트 구조"
permalink: /sitemap/
author_profile: true
---

<script src="https://d3js.org/d3.v7.min.js"></script>

<div class="sitemap-container">
  <h1>🗺️ 사이트 구조 탐색</h1>
  <p class="sitemap-intro">카테고리별 인터랙티브 그래프로 블로그 구조를 탐색해보세요!</p>
  
  <div class="controls">
    <button id="tree-view" class="view-btn active">🌳 트리 뷰</button>
    <button id="graph-view" class="view-btn">🕸️ 그래프 뷰</button>
    <button id="reset-view" class="control-btn">🔄 리셋</button>
    <button id="center-view" class="control-btn">🎯 중앙정렬</button>
  </div>
  
  <div id="sitemap-visualization"></div>
  
  <div class="legend">
    <h3>📋 범례</h3>
    <div class="legend-items">
      <div class="legend-item">
        <div class="node-sample root-node"></div>
        <span>메인</span>
      </div>
      <div class="legend-item">
        <div class="node-sample category-node"></div>
        <span>카테고리</span>
      </div>
      <div class="legend-item">
        <div class="node-sample post-node"></div>
        <span>게시물</span>
      </div>
      <div class="legend-item">
        <div class="node-sample page-node"></div>
        <span>페이지</span>
      </div>
    </div>
  </div>

  <div class="posts-list">
    <h3>📚 모든 게시물 (시간순)</h3>
    <div class="posts-grid">
      <!-- Jekyll liquid로 동적 생성 -->
      {% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" | sort: "name" | reverse %}
      {% for year_group in posts_by_year %}
      <div class="year-section">
        <h4>{{ year_group.name }}</h4>
        <ul class="post-list">
          {% assign sorted_posts = year_group.items | sort: "date" | reverse %}
          {% for post in sorted_posts %}
          <li>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
          </li>
          {% endfor %}
        </ul>
      </div>
      {% endfor %}
    </div>
  </div>
</div>

<style>
.sitemap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.sitemap-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.sitemap-intro {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1em;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.view-btn, .control-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid #007acc;
  border-radius: 8px;
  background: white;
  color: #007acc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  font-size: 0.9rem;
}

.view-btn.active, .view-btn:hover, .control-btn:hover {
  background: #007acc;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,122,204,0.3);
}

#sitemap-visualization {
  width: 100%;
  height: 700px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%);
  margin-bottom: 2rem;
  overflow: hidden;
  position: relative;
}

.legend {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.legend h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.node-sample {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #333;
}

.root-node {
  background: #ff6b6b;
  border-color: #e55a5a;
}

.category-node {
  background: #4ecdc4;
  border-color: #3cb3aa;
}

.post-node {
  background: #45b7d1;
  border-color: #3a9bc1;
}

.page-node {
  background: #96ceb4;
  border-color: #7fb69e;
}

/* 게시물 목록 스타일 */
.posts-list {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-top: 2rem;
  display: block !important;
  visibility: visible !important;
}

.posts-list h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
  border-bottom: 2px solid #007acc;
  padding-bottom: 0.5rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.year-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #007acc;
}

.year-section h4 {
  margin: 0 0 1rem 0;
  color: #007acc;
  font-size: 1.3rem;
  font-weight: bold;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-list li {
  margin-bottom: 0.8rem;
  padding: 0.8rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-list li:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  background: #f0f9ff;
}

.post-list a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
  flex: 1;
}

.post-list a:hover {
  color: #007acc;
}

.post-date {
  color: #666;
  font-size: 0.85rem;
  background: #e9ecef;
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  margin-left: 1rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .sitemap-container {
    padding: 1rem 0.5rem;
  }
  
  .sitemap-container h1 {
    font-size: 2rem;
  }
  
  .controls {
    gap: 0.5rem;
  }
  
  .view-btn, .control-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
  
  #sitemap-visualization {
    height: 500px;
  }
  
  .post-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .post-date {
    margin-left: 0;
    align-self: flex-end;
  }
}

/* 툴팁 스타일 */
.tooltip {
  position: absolute;
  text-align: center;
  padding: 8px 12px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 6px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

/* 그래프 컨트롤 버튼 */
.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 100;
}

.zoom-btn {
  width: 30px;
  height: 30px;
  border: 2px solid #007acc;
  border-radius: 50%;
  background: white;
  color: #007acc;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.zoom-btn:hover {
  background: #007acc;
  color: white;
  transform: scale(1.1);
}

/* 노드 스타일 */
.node {
  cursor: pointer;
  transition: all 0.3s ease;
  /* hover 시 크기 변화 제거하여 시뮬레이션 충돌 방지 */
}

.node:hover {
  /* transform: scale(1.1); 제거 - 시뮬레이션과 충돌 */
}

.link {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 2px;
}

.tooltip {
  position: absolute;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
  max-width: 250px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.node {
  cursor: pointer;
  stroke-width: 3px;
  stroke: white;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  transition: all 0.3s ease;
}

.node:hover {
  stroke-width: 4px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  transform: scale(1.1);
}

.link {
  fill: none;
  stroke: #999;
  stroke-width: 2px;
  stroke-opacity: 0.6;
  transition: all 0.3s ease;
}

.link:hover {
  stroke-width: 3px;
  stroke-opacity: 1;
}

.node text {
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  pointer-events: none;
  fill: #333;
  stroke: white;
  stroke-width: 3px;
  paint-order: stroke fill;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.node.root text {
  fill: white;
  stroke: #333;
  stroke-width: 2px;
  font-size: 14px;
  font-weight: 700;
}

.node.category text {
  fill: #333;
  stroke: white;
  stroke-width: 3px;
  font-size: 13px;
  font-weight: 700;
}

.node.post text {
  fill: #333;
  stroke: white;
  stroke-width: 2px;
  font-size: 11px;
}

.node.page text {
  fill: #333;
  stroke: white;
  stroke-width: 2px;
  font-size: 11px;
}

.category-label {
  font-size: 14px !important;
  font-weight: 700 !important;
}

.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 0.5rem;
}

.zoom-btn {
  width: 35px;
  height: 35px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Jekyll 데이터를 JavaScript로 전달
  const siteData = {
    posts: [
      {% for post in site.posts %}
      {
        title: "{{ post.title | escape }}",
        url: "{{ post.url | relative_url }}",
        date: "{{ post.date | date: '%Y-%m-%d' }}",
        year: "{{ post.date | date: '%Y' }}",
        categories: [{% for cat in post.categories %}"{{ cat }}"{% unless forloop.last %},{% endunless %}{% endfor %}],
        tags: [{% assign post_tags = post.tags | default: post.tag %}{% for tag in post_tags %}"{{ tag }}"{% unless forloop.last %},{% endunless %}{% endfor %}]
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ],
    pages: [
      {% for page in site.pages %}
      {% if page.title and page.url and page.layout != nil and page.layout != 'none' %}
      {
        title: "{{ page.title | escape }}",
        url: "{{ page.url | relative_url }}"
      }{% unless forloop.last %},{% endunless %}
      {% endif %}
      {% endfor %}
    ]
  };

  const width = document.getElementById('sitemap-visualization').clientWidth;
  const height = 700;
  
  let currentView = 'tree';
  let svg, simulation, nodes, links, zoom, isDragging = false;

  // 카테고리별 색상 매핑 (PARA 구조)
  const categoryColors = {
    // Projects
    'Projects': '#667eea',
    'Computer-Vision': '#4facfe', 
    'AI-Research': '#ff6b6b',
    'Web-Development': '#26de81',
    'Robotics': '#ff9f43',
    
    // Areas  
    'Areas': '#f093fb',
    'Health-Wellness': '#26de81',
    'Neuroscience': '#667eea',
    'Programming': '#5f6dee',
    'System-Setup': '#95afc0',
    
    // Resources
    'Resources': '#ff9f43', 
    'Study-Notes': '#4facfe',
    'Tools-Guides': '#26de81',
    'Code-Analysis': '#ff6b6b',
    'Research-Papers': '#667eea',
    
    // Archive
    'Archive': '#95afc0',
    'Blog-Setup': '#ddd',
    'Legacy-Projects': '#bbb',
    'Experiments': '#aaa',
    
    // 기타
    'default': '#95afc0'
  };

  function getNodeColor(type, category) {
    if (type === 'root') return 'url(#rootGradient)';
    if (type === 'category') return categoryColors[category] || categoryColors.default;
    if (type === 'post') {
      const mainCategory = category?.[0] || 'default';
      return categoryColors[mainCategory] || categoryColors.default;
    }
    if (type === 'page') return categoryColors.default;
    return '#999';
  }

  function initVisualization() {
    d3.select('#sitemap-visualization').selectAll('*').remove();
    
    svg = d3.select('#sitemap-visualization')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // 그래디언트 정의
    const defs = svg.append('defs');
    const rootGradient = defs.append('linearGradient')
      .attr('id', 'rootGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    
    rootGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea');
    
    rootGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2');

    // 줌 기능 추가
    zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        svg.selectAll('.main-group').attr('transform', event.transform);
      });
    
    svg.call(zoom);

    // 줌 컨트롤 버튼 추가
    const controlsDiv = d3.select('#sitemap-visualization')
      .append('div')
      .attr('class', 'graph-controls');
    
    controlsDiv.append('button')
      .attr('class', 'zoom-btn')
      .html('+')
      .on('click', () => svg.transition().call(zoom.scaleBy, 1.5));
    
    controlsDiv.append('button')
      .attr('class', 'zoom-btn')
      .html('−')
      .on('click', () => svg.transition().call(zoom.scaleBy, 1 / 1.5));
  }

  function createCategoryTreeData() {
    const treeData = {
      name: "JJo의 블로그",
      type: "root",
      children: []
    };

    // 카테고리별 게시물 그룹화
    const postsByCategory = {};
    siteData.posts.forEach(post => {
      const mainCategory = post.categories[0] || '기타';
      if (!postsByCategory[mainCategory]) {
        postsByCategory[mainCategory] = [];
      }
      postsByCategory[mainCategory].push(post);
    });

    // 카테고리별 노드 생성
    Object.keys(postsByCategory).forEach(category => {
      const categoryNode = {
        name: `${category} (${postsByCategory[category].length})`,
        type: "category",
        category: category,
        children: postsByCategory[category].map(post => ({
          name: post.title,
          type: "post",
          url: post.url,
          date: post.date,
          category: post.categories
        }))
      };
      treeData.children.push(categoryNode);
    });

    // 페이지 섹션
    const pagesSection = {
      name: `📄 페이지 (${siteData.pages.length})`,
      type: "category",
      category: "pages",
      children: siteData.pages.map(page => ({
        name: page.title,
        type: "page",
        url: page.url
      }))
    };

    treeData.children.push(pagesSection);

    return treeData;
  }

  function drawTree() {
    const treeData = createCategoryTreeData();
    const root = d3.hierarchy(treeData);
    
    const treeLayout = d3.tree()
      .size([height - 100, width - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

    treeLayout(root);

    const g = svg.append('g')
      .attr('class', 'main-group')
      .attr('transform', 'translate(100, 50)');

    // 링크 그리기
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .style('stroke', d => {
        if (d.target.data.type === 'category') return categoryColors[d.target.data.category] || categoryColors.default;
        return '#999';
      });

    // 노드 그리기
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // 노드 원
    node.append('circle')
      .attr('r', d => {
        if (d.data.type === 'root') return 12;
        if (d.data.type === 'category') return 8;
        return 5;
      })
      .attr('fill', d => getNodeColor(d.data.type, d.data.category))
      .attr('stroke', '#fff');

    // 노드 텍스트
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -15 : 15)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .attr('class', d => d.data.type === 'category' ? 'category-label' : '')
      .style('font-size', d => {
        if (d.data.type === 'root') return '16px';
        if (d.data.type === 'category') return '14px';
        return '12px';
      })
      .style('font-weight', d => {
        if (d.data.type === 'root') return '700';
        if (d.data.type === 'category') return '700';
        return '600';
      })
      .style('fill', d => {
        if (d.data.type === 'root') return 'white';
        return '#333';
      })
      .style('stroke', d => {
        if (d.data.type === 'root') return '#333';
        return 'white';
      })
      .style('stroke-width', d => {
        if (d.data.type === 'root') return '2px';
        if (d.data.type === 'category') return '3px';
        return '2px';
      })
      .style('paint-order', 'stroke fill')
      .text(d => {
        const maxLength = d.data.type === 'post' ? 20 : 25;
        return d.data.name.length > maxLength ?
               d.data.name.substring(0, maxLength) + '...' :
               d.data.name;
      });    addInteractions(node);
  }

  function drawGraph() {
    const nodes = [];
    const links = [];

    // 루트 노드
    nodes.push({ 
      id: 'root', 
      name: 'JJo의 블로그', 
      type: 'root', 
      x: width/2, 
      y: height/2,
      fx: width/2,
      fy: height/2
    });

    // 카테고리별 게시물 그룹화
    const postsByCategory = {};
    siteData.posts.forEach(post => {
      const mainCategory = post.categories[0] || '기타';
      if (!postsByCategory[mainCategory]) {
        postsByCategory[mainCategory] = [];
      }
      postsByCategory[mainCategory].push(post);
    });

    // 카테고리 노드들을 원형으로 배치
    const categories = Object.keys(postsByCategory);
    const categoryRadius = Math.min(width, height) * 0.25;
    
    categories.forEach((category, i) => {
      const angle = (2 * Math.PI * i) / categories.length;
      const categoryId = `category-${category}`;
      
      nodes.push({ 
        id: categoryId, 
        name: `${category} (${postsByCategory[category].length})`, 
        type: 'category',
        category: category,
        x: width/2 + categoryRadius * Math.cos(angle),
        y: height/2 + categoryRadius * Math.sin(angle)
      });
      
      links.push({ source: 'root', target: categoryId });

      // 각 카테고리의 게시물들을 카테고리 주변에 배치
      const posts = postsByCategory[category];
      const postRadius = 80;
      
      posts.forEach((post, j) => {
        const postAngle = (2 * Math.PI * j) / posts.length;
        const nodeId = `post-${category}-${j}`;
        
        nodes.push({ 
          id: nodeId, 
          name: post.title, 
          type: 'post', 
          url: post.url,
          category: post.categories,
          date: post.date,
          x: (width/2 + categoryRadius * Math.cos(angle)) + postRadius * Math.cos(postAngle),
          y: (height/2 + categoryRadius * Math.sin(angle)) + postRadius * Math.sin(postAngle)
        });
        
        links.push({ source: categoryId, target: nodeId });
      });
    });

    // 페이지 노드들
    siteData.pages.forEach((page, i) => {
      const nodeId = `page-${i}`;
      const angle = 2 * Math.PI * i / siteData.pages.length + Math.PI; // 하단에 배치
      const pageRadius = Math.min(width, height) * 0.3;
      
      nodes.push({ 
        id: nodeId, 
        name: page.title, 
        type: 'page', 
        url: page.url,
        x: width/2 + pageRadius * Math.cos(angle),
        y: height/2 + pageRadius * Math.sin(angle)
      });
      links.push({ source: 'root', target: nodeId });
    });

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        if (d.source.type === 'root') return 150;
        if (d.source.type === 'category') return 80;
        return 50;
      }))
      .force('charge', d3.forceManyBody().strength(d => {
        if (d.type === 'root') return -1000;
        if (d.type === 'category') return -500;
        return -200;
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        if (d.type === 'root') return 20;
        if (d.type === 'category') return 15;
        return 10;
      }))
      .alphaDecay(0.05) // 더 빠른 안정화
      .velocityDecay(0.9) // 더 빠른 속도 감소
      .alphaMin(0.001); // 더 낮은 최소 알파값으로 빠른 정지

    const g = svg.append('g').attr('class', 'main-group');

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', d => {
        if (d.target.type === 'category') return categoryColors[d.target.category] || categoryColors.default;
        return '#999';
      });

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node');

    node.append('circle')
      .attr('r', d => {
        if (d.type === 'root') return 15;
        if (d.type === 'category') return 10;
        return 6;
      })
      .attr('fill', d => getNodeColor(d.type, d.category))
      .attr('stroke', '#fff');

    node.append('text')
      .attr('dy', '0.31em')
      .attr('text-anchor', 'middle')
      .style('font-size', d => {
        if (d.type === 'root') return '14px';
        if (d.type === 'category') return '12px';
        return '10px';
      })
      .style('font-weight', d => {
        if (d.type === 'root') return '700';
        if (d.type === 'category') return '700';
        return '600';
      })
      .style('fill', d => {
        if (d.type === 'root') return 'white';
        return '#333';
      })
      .style('stroke', d => {
        if (d.type === 'root') return '#333';
        return 'white';
      })
      .style('stroke-width', d => {
        if (d.type === 'root') return '2px';
        if (d.type === 'category') return '3px';
        return '2px';
      })
      .style('paint-order', 'stroke fill')
      .text(d => {
        const maxLength = d.type === 'post' ? 12 : 15;
        return d.name.length > maxLength ?
               d.name.substring(0, maxLength) + '...' :
               d.name;
      });    // 드래그 기능 (클릭과 분리)
    node.call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      isDragging = false;
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      isDragging = true;
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      if (d.type !== 'root') {
        d.fx = null;
        d.fy = null;
      }
      // 짧은 지연 후 isDragging 리셋
      setTimeout(() => { isDragging = false; }, 100);
    }

    addInteractions(node);
  }

  function addInteractions(node) {
    // 툴팁
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    node.on('mouseover', (event, d) => {
      // 그래프 뷰에서 시뮬레이션 완전 중지
      if (currentView === 'graph' && simulation) {
        simulation.stop();
        // 모든 노드의 속도를 0으로 설정하여 완전히 멈춤
        simulation.nodes().forEach(node => {
          node.vx = 0;
          node.vy = 0;
        });
      }
      
      tooltip.transition().duration(200).style('opacity', .9);
      
      let tooltipContent = `<strong>${d.data?.name || d.name}</strong>`;
      if (d.data?.date || d.date) {
        tooltipContent += `<br>📅 ${d.data?.date || d.date}`;
      }
      if (d.data?.category || d.category) {
        const categories = Array.isArray(d.data?.category || d.category) ?
                          (d.data?.category || d.category).join(', ') :
                          (d.data?.category || d.category);
        tooltipContent += `<br>🏷️ ${categories}`;
      }
      // 클릭 안내 메시지 제거
      
      tooltip.html(tooltipContent)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      // 마우스가 벗어나도 시뮬레이션을 다시 시작하지 않음
      tooltip.transition().duration(500).style('opacity', 0);
    })
    .on('click', (event, d) => {
      // 클릭 이동 기능 제거 - 시각적 피드백만 제공
      event.preventDefault();
      event.stopPropagation();
      
      // 간단한 시각적 피드백 (선택적)
      const node = event.currentTarget;
      node.style.transform = 'scale(1.1)';
      setTimeout(() => {
        node.style.transform = 'scale(1)';
      }, 200);
    });
  }

  function switchView(view) {
    currentView = view;
    initVisualization();
    
    if (view === 'tree') {
      drawTree();
    } else {
      drawGraph();
    }
    
    // 버튼 상태 업데이트
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');
  }

  function centerView() {
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );
  }

  // 이벤트 리스너
  document.getElementById('tree-view').addEventListener('click', () => switchView('tree'));
  document.getElementById('graph-view').addEventListener('click', () => switchView('graph'));
  document.getElementById('reset-view').addEventListener('click', () => switchView(currentView));
  document.getElementById('center-view').addEventListener('click', centerView);

  // 초기 로드
  initVisualization();
  drawTree();
});
</script>

