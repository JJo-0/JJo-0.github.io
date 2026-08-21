import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const shell = document.querySelector('.atlas-shell');
const canvas = document.querySelector('#universe-canvas');
const backendPill = document.querySelector('#backend-pill');
const countPill = document.querySelector('#count-pill');
const loadingCard = document.querySelector('#loading-card');
const lensName = document.querySelector('#lens-name');
const visibleCount = document.querySelector('#visible-count');
const fpsValue = document.querySelector('#fps-value');
const legend = document.querySelector('#legend');
const labelsLayer = document.querySelector('#node-labels');
const hoverCard = document.querySelector('#hover-card');
const searchInput = document.querySelector('#node-search');
const searchResults = document.querySelector('#search-results');
const statusFilter = document.querySelector('#status-filter');
const edgeToggle = document.querySelector('#edge-toggle');
const resetView = document.querySelector('#reset-view');
const fullscreenToggle = document.querySelector('#fullscreen-toggle');
const tableSearch = document.querySelector('#table-search');
const tableBody = document.querySelector('#node-table-body');

const inspectorEmpty = document.querySelector('#inspector-empty');
const inspectorContent = document.querySelector('#inspector-content');
const nodeKind = document.querySelector('#node-kind');
const nodeTitle = document.querySelector('#node-title');
const nodeTitleKo = document.querySelector('#node-title-ko');
const nodeId = document.querySelector('#node-id');
const nodeDescription = document.querySelector('#node-description');
const nodeBadges = document.querySelector('#node-badges');
const scoreGrid = document.querySelector('#score-grid');
const neighborList = document.querySelector('#neighbor-list');
const clearSelection = document.querySelector('#clear-selection');
const traceUpstream = document.querySelector('#trace-upstream');
const traceDownstream = document.querySelector('#trace-downstream');
const traceClear = document.querySelector('#trace-clear');
const marketBaseline = document.querySelector('#market-baseline');

const GROUP_ORDER = ['DEM','PROD','DESIGN','WAF','MASK','FE','PC','MAT','EQCOMP','FAB','AUTO','PKG','TEST','HBM','SERVICE'];
const PROCESS_X = { DEM:-8, PROD:-6.5, DESIGN:-5.2, WAF:-3.8, MASK:-2.6, MAT:-1.8, FE:0, EQCOMP:.7, FAB:1.6, PC:2.5, AUTO:3.5, PKG:5, HBM:6.2, TEST:7.3, SERVICE:8.4 };
const STATUS_X = { VERIFIED:-4.5, PARTIAL:0, UNKNOWN:4.5 };
const EVIDENCE_Y = { A:3.5, B:1.8, C:0, D:-1.8, E:-3.5 };
const KIND_Y = { demand:4.5, product:3.5, software:2.5, material:1.5, process:.5, inspection:-.5, component:-1.5, infrastructure:-2.5, packaging:-3, test:-3.5, hbm:-4, supplier:2.5, buyer:-2.5, service:-4.5, geography:0, ecosystem:0 };
const REGION_CENTERS = new Map();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let graph;
let nodes;
let edges;
let nodeById;
let indexById;
let incident;
let renderer;
let scene;
let camera;
let controls;
let nodeMesh;
let edgeLines;
let focusLines;
let selectionHalo;
let positions;
let targets;
let selectedId = null;
let hoveredId = null;
let lens = 'taxonomy';
let edgesEnabled = true;
let traceSet = new Set();
let frameHandle = 0;
let lastFrame = performance.now();
let fpsFrames = 0;
let fpsStarted = lastFrame;
let visibleMask = [];
let topLabelRecords = [];
let selectedLabel = null;
const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function hash01(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function topGroup(node) {
  return GROUP_ORDER.includes(node.group) ? node.group : 'SERVICE';
}

function relatedGroup(node) {
  const links = incident.get(node.id) || [];
  const score = new Map();
  for (const e of links) {
    const other = nodeById.get(e.source === node.id ? e.target : e.source);
    if (!other || !GROUP_ORDER.includes(other.group)) continue;
    score.set(other.group, (score.get(other.group) || 0) + 1 + other.depth * .1);
  }
  return [...score.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] || 'SERVICE';
}

function taxonomyPosition(node) {
  if (node.id === 'SEM') return new THREE.Vector3(0,0,0);
  if (node.group === 'GEO') {
    const a = hash01(node.id) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a)*10.5, Math.sin(a)*10.5, 0);
  }
  if (node.group === 'COMPANY') {
    const group = relatedGroup(node);
    const gi = GROUP_ORDER.indexOf(group);
    const base = (gi / GROUP_ORDER.length) * Math.PI * 2 - Math.PI/2;
    const jitter = (hash01(node.id)-.5)*.52;
    const r = node.kind === 'buyer' ? 7.4 : 8.4;
    return new THREE.Vector3(Math.cos(base+jitter)*r, Math.sin(base+jitter)*r*.82, (hash01(node.id+'z')-.5)*3.5);
  }
  const gi = Math.max(0, GROUP_ORDER.indexOf(topGroup(node)));
  const base = (gi / GROUP_ORDER.length) * Math.PI * 2 - Math.PI/2;
  const jitter = (hash01(node.id)-.5) * (.28 + node.depth*.18);
  const r = 2.3 + node.depth*1.25 + (hash01(node.id+'r')-.5)*.6;
  return new THREE.Vector3(Math.cos(base+jitter)*r, Math.sin(base+jitter)*r*.78, (hash01(node.id+'z')-.5)*(1.1+node.depth*.9));
}

function processPosition(node) {
  if (node.id === 'SEM') return new THREE.Vector3(-9.5,0,0);
  if (node.group === 'GEO') return new THREE.Vector3(10.5,(hash01(node.id)-.5)*8,-3);
  let group = node.group;
  if (group === 'COMPANY') group = relatedGroup(node);
  const baseX = PROCESS_X[group] ?? 0;
  const roleOffset = node.group === 'COMPANY' ? (node.kind === 'buyer' ? 2.1 : -2.1) : 0;
  const y = (KIND_Y[node.kind] ?? 0) + roleOffset + (hash01(node.id+'y')-.5)*1.4;
  const z = (hash01(node.id+'z')-.5)*5 + node.depth*.16;
  return new THREE.Vector3(baseX,y,z);
}

function companyPosition(node) {
  if (node.group === 'COMPANY') {
    const region = node.region || 'Global';
    const regionIndex = [...new Set(nodes.filter(n=>n.group==='COMPANY').map(n=>n.region||'Global'))].sort().indexOf(region);
    const col = regionIndex % 5;
    const row = Math.floor(regionIndex / 5);
    const centerX = (col-2)*4.3;
    const centerY = (1-row)*5.2;
    const a = hash01(node.id)*Math.PI*2;
    const r = 1.1 + hash01(node.id+'r')*1.4;
    return new THREE.Vector3(centerX+Math.cos(a)*r, centerY+Math.sin(a)*r, (hash01(node.id+'z')-.5)*2.8);
  }
  if (node.group === 'GEO') {
    const companies = nodes.filter(n=>n.group==='COMPANY' && n.region===node.region);
    if (companies.length) {
      const p = companyPosition(companies[0]);
      return new THREE.Vector3(p.x,p.y,3.7);
    }
  }
  const gi = GROUP_ORDER.indexOf(node.group);
  const a = (Math.max(0,gi)/GROUP_ORDER.length)*Math.PI*2;
  const r = 5.5 + node.depth*.35;
  return new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.75,(hash01(node.id)-.5)*2);
}

function geographyPosition(node) {
  const regions = [...new Set(nodes.filter(n=>n.group==='COMPANY').map(n=>n.region||'Global'))].sort();
  regions.forEach((region,i)=>{
    const cols=5;
    REGION_CENTERS.set(region,new THREE.Vector3((i%cols-2)*4.5,(1-Math.floor(i/cols))*5.4,0));
  });
  if (node.group === 'COMPANY') {
    const center=REGION_CENTERS.get(node.region||'Global')||new THREE.Vector3();
    const a=hash01(node.id)*Math.PI*2;
    const r=.8+hash01(node.id+'r')*1.5;
    return new THREE.Vector3(center.x+Math.cos(a)*r,center.y+Math.sin(a)*r,(hash01(node.id+'z')-.5)*2.2);
  }
  if (node.group === 'GEO') {
    const center=REGION_CENTERS.get(node.region)||new THREE.Vector3();
    return new THREE.Vector3(center.x,center.y,3.2);
  }
  const gi=Math.max(0,GROUP_ORDER.indexOf(node.group));
  const a=(gi/GROUP_ORDER.length)*Math.PI*2;
  return new THREE.Vector3(Math.cos(a)*3.2,Math.sin(a)*2.4,-5+(hash01(node.id)-.5));
}

function evidencePosition(node) {
  const status=node.status||'UNKNOWN';
  const x=(STATUS_X[status]??4.5)+(hash01(node.id)-.5)*2.2;
  const y=(EVIDENCE_Y[node.evidence]??-4.8)+(hash01(node.id+'y')-.5)*1.2;
  const gi=GROUP_ORDER.indexOf(node.group);
  const z=node.group==='COMPANY' ? (hash01(node.region||node.id)-.5)*8 : ((gi>=0?gi:0)-GROUP_ORDER.length/2)*.55;
  return new THREE.Vector3(x,y,z);
}

function computeTargets() {
  const fn = lens === 'process' ? processPosition : lens === 'company' ? companyPosition : lens === 'geography' ? geographyPosition : lens === 'evidence' ? evidencePosition : taxonomyPosition;
  for (let i=0;i<nodes.length;i+=1) {
    const p=fn(nodes[i]);
    targets[i*3]=p.x; targets[i*3+1]=p.y; targets[i*3+2]=p.z;
  }
}

function scaleFor(node) {
  const base = .55 + Math.min(5,node.importance||2)*.14;
  if (node.depth===1 && node.group!=='COMPANY' && node.group!=='GEO') return base*1.35;
  if (node.kind==='buyer') return base*1.15;
  return base;
}

function isVisible(node) {
  const sf=statusFilter.value;
  if (sf!=='all' && node.status!==sf) return false;
  if (lens==='company' && !['COMPANY','GEO'].includes(node.group) && node.depth>2) return false;
  if (lens==='geography' && !['COMPANY','GEO'].includes(node.group) && node.depth>1) return false;
  return true;
}

function updateVisibilityAndColors() {
  visibleMask=nodes.map(isVisible);
  let count=0;
  for (let i=0;i<nodes.length;i+=1) {
    const n=nodes[i];
    const visible=visibleMask[i];
    if (visible) count+=1;
    let color=new THREE.Color(n.color||'#94a3b8');
    if (lens==='evidence') {
      color=new THREE.Color(n.status==='VERIFIED'?'#34d399':n.status==='PARTIAL'?'#fbbf24':'#f87171');
    } else if (lens==='company' && n.group==='COMPANY') {
      color=new THREE.Color(n.kind==='buyer'?'#f472b6':n.kind==='service'?'#a3a3a3':'#38bdf8');
    } else if (lens==='geography' && n.group==='COMPANY') {
      color=new THREE.Color(n.region?.startsWith('Korea')?'#22d3ee':n.region==='Japan'?'#f472b6':n.region==='United States'?'#60a5fa':'#a78bfa');
    }
    const inTrace=traceSet.size===0||traceSet.has(n.id)||n.id===selectedId;
    if (!inTrace) color.multiplyScalar(.22);
    if (n.id===selectedId) color=new THREE.Color('#ffffff');
    nodeMesh.setColorAt(i,color);
  }
  nodeMesh.instanceColor.needsUpdate=true;
  visibleCount.textContent=String(count);
  updateLegend();
  updateEdgeVisibility();
}

function updateLegend() {
  let items;
  if (lens==='evidence') items=[['VERIFIED','#34d399'],['PARTIAL','#fbbf24'],['UNKNOWN','#f87171']];
  else if (lens==='company') items=[['Supplier','#38bdf8'],['Buyer / platform','#f472b6'],['Taxonomy','#94a3b8']];
  else if (lens==='geography') items=[['Korea','#22d3ee'],['Japan','#f472b6'],['United States','#60a5fa'],['Other','#a78bfa']];
  else items=GROUP_ORDER.slice(0,8).map(g=>[g,nodes.find(n=>n.group===g)?.color||'#94a3b8']);
  legend.innerHTML=items.map(([name,color])=>`<div class="legend-item"><span class="legend-dot" style="background:${color};color:${color}"></span>${name}</div>`).join('');
}

function updateMatrices(alpha=.12) {
  for (let i=0;i<nodes.length;i+=1) {
    const j=i*3;
    positions[j]+= (targets[j]-positions[j])*alpha;
    positions[j+1]+= (targets[j+1]-positions[j+1])*alpha;
    positions[j+2]+= (targets[j+2]-positions[j+2])*alpha;
    tempPosition.set(positions[j],positions[j+1],positions[j+2]);
    const visible=visibleMask[i];
    let s=visible?scaleFor(nodes[i]):0;
    if (traceSet.size && !traceSet.has(nodes[i].id) && nodes[i].id!==selectedId) s*=.45;
    if (nodes[i].id===selectedId) s*=1.7;
    tempScale.setScalar(s);
    tempMatrix.compose(tempPosition,tempQuaternion,tempScale);
    nodeMesh.setMatrixAt(i,tempMatrix);
  }
  nodeMesh.instanceMatrix.needsUpdate=true;
  updateEdgePositions();
  updateHalo();
}

function edgeAllowed(edge) {
  if (!edgesEnabled) return false;
  const si=indexById.get(edge.source), ti=indexById.get(edge.target);
  if (si===undefined||ti===undefined||!visibleMask[si]||!visibleMask[ti]) return false;
  if (lens==='taxonomy') return ['taxonomy','process','requires','consumes','controlled-by'].includes(edge.relation);
  if (lens==='process') return edge.relation!=='located-in';
  if (lens==='company') return ['supplies','buys/uses','HVM','FCBGA HVM','HBM4 HVM','HBM4 agreement','High-NA HVM','co-development','long-term gas supply'].includes(edge.relation);
  if (lens==='geography') return edge.relation==='located-in';
  return true;
}

function updateEdgePositions() {
  const arr=edgeLines.geometry.attributes.position.array;
  let cursor=0;
  for (const e of edges) {
    if (!edgeAllowed(e)) continue;
    const si=indexById.get(e.source),ti=indexById.get(e.target);
    arr[cursor++]=positions[si*3]; arr[cursor++]=positions[si*3+1]; arr[cursor++]=positions[si*3+2];
    arr[cursor++]=positions[ti*3]; arr[cursor++]=positions[ti*3+1]; arr[cursor++]=positions[ti*3+2];
  }
  edgeLines.geometry.setDrawRange(0,cursor/3);
  edgeLines.geometry.attributes.position.needsUpdate=true;
  updateFocusEdges();
}

function updateEdgeVisibility() {
  edgeToggle.textContent=edgesEnabled?'Edges ON':'Edges OFF';
  edgeToggle.setAttribute('aria-pressed',String(edgesEnabled));
  edgeLines.visible=edgesEnabled;
  focusLines.visible=edgesEnabled && Boolean(selectedId);
}

function updateFocusEdges() {
  const arr=focusLines.geometry.attributes.position.array;
  let cursor=0;
  if (selectedId) {
    for (const e of incident.get(selectedId)||[]) {
      if (!edgeAllowed(e)) continue;
      const si=indexById.get(e.source),ti=indexById.get(e.target);
      arr[cursor++]=positions[si*3]; arr[cursor++]=positions[si*3+1]; arr[cursor++]=positions[si*3+2];
      arr[cursor++]=positions[ti*3]; arr[cursor++]=positions[ti*3+1]; arr[cursor++]=positions[ti*3+2];
    }
  }
  focusLines.geometry.setDrawRange(0,cursor/3);
  focusLines.geometry.attributes.position.needsUpdate=true;
}

function updateHalo() {
  if (!selectedId) { selectionHalo.visible=false; return; }
  const i=indexById.get(selectedId);
  if (i===undefined||!visibleMask[i]) { selectionHalo.visible=false; return; }
  selectionHalo.visible=true;
  selectionHalo.position.set(positions[i*3],positions[i*3+1],positions[i*3+2]);
  const pulse=reducedMotion?1:1+Math.sin(performance.now()*.004)*.12;
  selectionHalo.scale.setScalar(scaleFor(nodes[i])*1.75*pulse);
}

function projectLabel(node, element) {
  const i=indexById.get(node.id);
  if (i===undefined||!visibleMask[i]) { element.hidden=true; return; }
  tempPosition.set(positions[i*3],positions[i*3+1],positions[i*3+2]).project(camera);
  const rect=canvas.getBoundingClientRect();
  const x=(tempPosition.x*.5+.5)*rect.width;
  const y=(-tempPosition.y*.5+.5)*rect.height;
  const visible=tempPosition.z>-1&&tempPosition.z<1&&x>-100&&x<rect.width+100&&y>-50&&y<rect.height+50;
  element.hidden=!visible;
  if (visible) element.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
}

function updateLabels() {
  for (const record of topLabelRecords) projectLabel(record.node,record.element);
  if (selectedLabel && selectedId) projectLabel(nodeById.get(selectedId),selectedLabel);
}

function renderInspector(node) {
  if (!node) {
    inspectorEmpty.hidden=false; inspectorContent.hidden=true; return;
  }
  inspectorEmpty.hidden=true; inspectorContent.hidden=false;
  nodeKind.textContent=`${node.kind} · ${node.group}`;
  nodeTitle.textContent=node.label;
  nodeTitleKo.textContent=node.labelKo||'';
  nodeId.textContent=node.id;
  nodeDescription.textContent=node.description||'';
  nodeBadges.innerHTML=[
    `<span class="node-badge ${node.status?.toLowerCase()}">${node.status||'UNKNOWN'}</span>`,
    `<span class="node-badge">Evidence ${node.evidence||'—'}</span>`,
    `<span class="node-badge">${node.coverage||'PARTIAL'}</span>`,
    node.region?`<span class="node-badge">${node.region}</span>`:''
  ].join('');
  scoreGrid.innerHTML=[
    ['Chokepoint',node.chokepoint],['AI / HBM',node.aiHbm],['Korea gap',node.koreaGap]
  ].map(([label,value])=>`<div class="score-card"><span>${label}</span><strong>${value??'—'} / 5</strong></div>`).join('');
  const links=(incident.get(node.id)||[]).slice().sort((a,b)=>a.relation.localeCompare(b.relation));
  neighborList.innerHTML='';
  for (const edge of links.slice(0,36)) {
    const otherId=edge.source===node.id?edge.target:edge.source;
    const other=nodeById.get(otherId);
    if (!other) continue;
    const button=document.createElement('button');
    button.className='neighbor-button';
    button.innerHTML=`<span>${escapeHtml(other.label)}</span><small>${escapeHtml(edge.relation)}</small>`;
    button.addEventListener('click',()=>selectNode(other.id,true));
    neighborList.append(button);
  }
}

function selectNode(id,focus=false) {
  if (!nodeById.has(id)) return;
  selectedId=id; traceSet.clear();
  renderInspector(nodeById.get(id));
  if (!selectedLabel) {
    selectedLabel=document.createElement('div'); selectedLabel.className='node-label is-selected'; labelsLayer.append(selectedLabel);
  }
  selectedLabel.textContent=nodeById.get(id).label;
  selectedLabel.hidden=false;
  updateVisibilityAndColors();
  if (focus) focusSelected();
  const url=new URL(location.href); url.searchParams.set('node',id); history.replaceState(null,'',url);
}

function clearSelected() {
  selectedId=null; traceSet.clear(); renderInspector(null);
  if (selectedLabel) selectedLabel.hidden=true;
  updateVisibilityAndColors();
  const url=new URL(location.href); url.searchParams.delete('node'); history.replaceState(null,'',url);
}

function focusSelected() {
  if (!selectedId) return;
  const i=indexById.get(selectedId);
  const target=new THREE.Vector3(positions[i*3],positions[i*3+1],positions[i*3+2]);
  controls.target.copy(target);
  const direction=camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(target.clone().add(direction.multiplyScalar(5.2)));
  controls.update();
}

function trace(direction) {
  if (!selectedId) return;
  traceSet=new Set([selectedId]);
  const queue=[selectedId];
  let depth=0;
  while (queue.length && depth<3 && traceSet.size<90) {
    const level=queue.splice(0);
    for (const id of level) {
      for (const e of incident.get(id)||[]) {
        const next=direction==='in' ? (e.target===id?e.source:null) : (e.source===id?e.target:null);
        if (next&&!traceSet.has(next)) { traceSet.add(next); queue.push(next); }
      }
    }
    depth+=1;
  }
  updateVisibilityAndColors();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function searchNodes(query) {
  const q=query.trim().toLowerCase();
  if (!q) return [];
  return nodes.map(n=>{
    const fields=[n.id,n.label,n.labelKo,n.kind,n.group,n.region,n.description].filter(Boolean).join(' ').toLowerCase();
    let score=0;
    if (n.id.toLowerCase()===q||n.label.toLowerCase()===q) score=100;
    else if (n.label.toLowerCase().startsWith(q)) score=40;
    else if (n.id.toLowerCase().includes(q)) score=30;
    else if (fields.includes(q)) score=10;
    return {n,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||b.n.importance-a.n.importance).slice(0,14).map(x=>x.n);
}

function showSearchResults() {
  const results=searchNodes(searchInput.value);
  searchResults.innerHTML='';
  if (!results.length) { searchResults.hidden=true; return; }
  for (const n of results) {
    const button=document.createElement('button');
    button.className='search-result';
    button.innerHTML=`<span>${escapeHtml(n.label)}<br><small>${escapeHtml(n.id)}</small></span><small>${escapeHtml(n.status)}</small>`;
    button.addEventListener('click',()=>{ selectNode(n.id,true); searchResults.hidden=true; searchInput.value=n.label; });
    searchResults.append(button);
  }
  searchResults.hidden=false;
}

function renderTable(filter='') {
  const q=filter.trim().toLowerCase();
  const rows=nodes.filter(n=>!q||[n.id,n.label,n.labelKo,n.kind,n.group,n.status,n.region].filter(Boolean).join(' ').toLowerCase().includes(q));
  tableBody.innerHTML=rows.map(n=>`<tr data-node-id="${escapeHtml(n.id)}"><td>${escapeHtml(n.id)}</td><td>${escapeHtml(n.label)}${n.labelKo?`<br><small>${escapeHtml(n.labelKo)}</small>`:''}</td><td>${escapeHtml(n.kind)}</td><td>${escapeHtml(n.group)}</td><td>${escapeHtml(n.status)}</td><td>${escapeHtml(n.evidence)}</td></tr>`).join('');
  for (const row of tableBody.querySelectorAll('tr')) row.addEventListener('click',()=>selectNode(row.dataset.nodeId,true));
}

async function createRenderer() {
  // Three.js WebGPURenderer selects WebGPU when available and transparently
  // falls back to its WebGL2 backend. Both import-map aliases resolve to the
  // same module URL so scene objects and renderer share one Three.js instance.
  const gpuRenderer=new WebGPURenderer({
    canvas,
    antialias:true,
    alpha:true,
    powerPreference:'high-performance',
  });
  await gpuRenderer.init();
  renderer=gpuRenderer;
  const backend=gpuRenderer.backend;
  backendPill.textContent=backend?.isWebGPUBackend
    ? 'WEBGPU'
    : backend?.isWebGLBackend
      ? 'WEBGL2 FALLBACK'
      : 'GPU READY';
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<720?1.25:1.75));
  renderer.setClearColor(0x04070c,1);
}

function createScene() {
  scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x04070c,.018);
  camera=new THREE.PerspectiveCamera(48,1,.1,80);
  camera.position.set(0,0,17);
  controls=new OrbitControls(camera,canvas);
  controls.enableDamping=true; controls.dampingFactor=.075; controls.minDistance=3; controls.maxDistance=36;
  controls.autoRotate=!reducedMotion; controls.autoRotateSpeed=.22;

  const geometry=new THREE.IcosahedronGeometry(.16,1);
  const material=new THREE.MeshBasicMaterial({ vertexColors:true, transparent:true, opacity:.94 });
  nodeMesh=new THREE.InstancedMesh(geometry,material,nodes.length);
  nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  nodeMesh.frustumCulled=false;
  scene.add(nodeMesh);

  const edgeGeometry=new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(edges.length*6),3).setUsage(THREE.DynamicDrawUsage));
  const edgeMaterial=new THREE.LineBasicMaterial({ color:0x64748b, transparent:true, opacity:.16 });
  edgeLines=new THREE.LineSegments(edgeGeometry,edgeMaterial); edgeLines.frustumCulled=false; scene.add(edgeLines);

  const focusGeometry=new THREE.BufferGeometry();
  focusGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(edges.length*6),3).setUsage(THREE.DynamicDrawUsage));
  const focusMaterial=new THREE.LineBasicMaterial({ color:0x67e8f9, transparent:true, opacity:.9 });
  focusLines=new THREE.LineSegments(focusGeometry,focusMaterial); focusLines.frustumCulled=false; scene.add(focusLines);

  selectionHalo=new THREE.Mesh(new THREE.TorusGeometry(.22,.025,8,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}));
  selectionHalo.visible=false; scene.add(selectionHalo);

  const starsGeometry=new THREE.BufferGeometry();
  const starCount=innerWidth<720?180:420;
  const starPositions=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i+=1){
    const a=hash01(`star-${i}`)*Math.PI*2, r=12+hash01(`r-${i}`)*18;
    starPositions[i*3]=Math.cos(a)*r; starPositions[i*3+1]=Math.sin(a)*r; starPositions[i*3+2]=(hash01(`z-${i}`)-.5)*24;
  }
  starsGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
  scene.add(new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:0x334155,size:.035,transparent:true,opacity:.55,depthWrite:false})));
}

function createLabels() {
  const topNodes=nodes.filter(n=>n.depth===1&&GROUP_ORDER.includes(n.group));
  for (const n of topNodes) {
    const el=document.createElement('div'); el.className='node-label'; el.textContent=n.group; labelsLayer.append(el);
    topLabelRecords.push({node:n,element:el});
  }
}

function resize() {
  const rect=canvas.getBoundingClientRect();
  if (!rect.width||!rect.height) return;
  camera.aspect=rect.width/rect.height; camera.updateProjectionMatrix(); renderer.setSize(rect.width,rect.height,false);
}

function pointerToNdc(event) {
  const rect=canvas.getBoundingClientRect();
  pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
}

function pick(event,select=false) {
  pointerToNdc(event); raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(nodeMesh,false)[0];
  const id=hit?.instanceId!==undefined?nodes[hit.instanceId]?.id:null;
  if (select&&id) selectNode(id,event.detail>1);
  if (!select) {
    hoveredId=id;
    if (!id) { hoverCard.hidden=true; return; }
    const n=nodeById.get(id); hoverCard.hidden=false;
    hoverCard.innerHTML=`<strong>${escapeHtml(n.label)}</strong><span>${escapeHtml(n.id)} · ${escapeHtml(n.status)}</span>`;
    const rect=canvas.getBoundingClientRect();
    hoverCard.style.left=`${Math.min(rect.width-280,event.clientX-rect.left+14)}px`;
    hoverCard.style.top=`${Math.min(rect.height-90,event.clientY-rect.top+14)}px`;
  }
}

function updateMarketBaseline() {
  marketBaseline.innerHTML=graph.marketBaseline.map(m=>`<div class="market-row"><span>${escapeHtml(m.metric)} · ${escapeHtml(m.period)} ${escapeHtml(m.status)}</span><strong>${escapeHtml(m.value)}</strong></div>`).join('');
}

function setLens(next) {
  lens=next; lensName.textContent=next.toUpperCase();
  document.querySelectorAll('[data-lens]').forEach(b=>b.classList.toggle('is-active',b.dataset.lens===next));
  computeTargets(); updateVisibilityAndColors();
  const url=new URL(location.href); url.searchParams.set('lens',next); history.replaceState(null,'',url);
}

function resetCamera() {
  controls.target.set(0,0,0); camera.position.set(0,0,lens==='process'?21:17); controls.update();
}

function animate(now) {
  frameHandle=requestAnimationFrame(animate);
  const dt=Math.min((now-lastFrame)/1000,.08); lastFrame=now;
  controls.update(); updateMatrices(reducedMotion?.24:.10); updateLabels();
  selectionHalo.rotation.z+=dt*.6;
  renderer.render(scene,camera);
  fpsFrames+=1;
  if (now-fpsStarted>=1000) {
    fpsValue.textContent=String(Math.round(fpsFrames*1000/(now-fpsStarted)));
    fpsFrames=0; fpsStarted=now;
  }
}

function bindEvents() {
  addEventListener('resize',resize,{passive:true});
  canvas.addEventListener('pointermove',e=>pick(e,false),{passive:true});
  canvas.addEventListener('pointerleave',()=>{hoverCard.hidden=true;hoveredId=null;},{passive:true});
  canvas.addEventListener('click',e=>pick(e,true));
  searchInput.addEventListener('input',showSearchResults);
  searchInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){const n=searchNodes(searchInput.value)[0];if(n){selectNode(n.id,true);searchResults.hidden=true;}} if(e.key==='Escape')searchResults.hidden=true; });
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))searchResults.hidden=true;});
  document.querySelectorAll('[data-lens]').forEach(b=>b.addEventListener('click',()=>setLens(b.dataset.lens)));
  statusFilter.addEventListener('change',updateVisibilityAndColors);
  edgeToggle.addEventListener('click',()=>{edgesEnabled=!edgesEnabled;updateEdgeVisibility();});
  resetView.addEventListener('click',resetCamera);
  fullscreenToggle.addEventListener('click',async()=>{ if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); });
  clearSelection.addEventListener('click',clearSelected);
  traceUpstream.addEventListener('click',()=>trace('in'));
  traceDownstream.addEventListener('click',()=>trace('out'));
  traceClear.addEventListener('click',()=>{traceSet.clear();updateVisibilityAndColors();});
  tableSearch.addEventListener('input',()=>renderTable(tableSearch.value));
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){cancelAnimationFrame(frameHandle);frameHandle=0;} else if(!frameHandle){lastFrame=performance.now();frameHandle=requestAnimationFrame(animate);} });
}

async function init() {
  try {
    const response=await fetch('./graph.json',{cache:'no-store'});
    if(!response.ok) throw new Error(`graph.json HTTP ${response.status}`);
    graph=await response.json(); nodes=graph.nodes; edges=graph.edges;
    nodeById=new Map(nodes.map(n=>[n.id,n])); indexById=new Map(nodes.map((n,i)=>[n.id,i]));
    edges=edges.filter(e=>nodeById.has(e.source)&&nodeById.has(e.target));
    incident=new Map(nodes.map(n=>[n.id,[]]));
    for(const e of edges){incident.get(e.source).push(e);incident.get(e.target).push(e);}
    positions=new Float32Array(nodes.length*3); targets=new Float32Array(nodes.length*3);
    computeTargets(); positions.set(targets); visibleMask=nodes.map(()=>true);
    countPill.textContent=`${nodes.length} NODES · ${edges.length} EDGES`;
    updateMarketBaseline(); renderTable();
    await createRenderer(); createScene(); createLabels(); bindEvents(); resize(); updateVisibilityAndColors();
    shell.dataset.atlasState='ready'; window.__semiconductorAtlasReady=true;
    const params=new URLSearchParams(location.search);
    const initialLens=params.get('lens'); if(['taxonomy','process','company','geography','evidence'].includes(initialLens)) setLens(initialLens);
    const initialNode=params.get('node'); if(initialNode&&nodeById.has(initialNode)) selectNode(initialNode,true);
    frameHandle=requestAnimationFrame(animate);
  } catch(error) {
    console.error(error); window.__semiconductorAtlasReady=true; shell.dataset.atlasState='error'; backendPill.textContent='2D FALLBACK';
    loadingCard.innerHTML=`<strong>3D renderer unavailable</strong><span>${escapeHtml(error.message)} · 아래 2D table과 graph.json은 계속 사용할 수 있습니다.</span>`;
  }
}

init();
