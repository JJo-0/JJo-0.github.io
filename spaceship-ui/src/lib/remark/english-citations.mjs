/** Native citations for the English collection only; never modify Korean sources. */
export default function englishCitations() {
  return (tree, file) => {
    if (!String(file.path || file.history?.[0] || '').replaceAll('\\','/').includes('/content/english/')) return;
    const references = new Map();
    for (const node of tree.children || []) {
      const first=node.type==='paragraph' && node.children?.[0];
      const match=first?.type==='text' && first.value.match(/^\[(\d+)\]\s/);
      if (!match) continue;
      const n=match[1];
      if(references.has(n)) throw new Error(`Duplicate English reference ${n}`);
      references.set(n,node);
      node.data={...node.data,hProperties:{...node.data?.hProperties,id:`news-ref-${n}`,'data-news-reference':n}};
    }
    const skip=new Set([...references.values()]);
    function walk(parent) {
      if(!parent.children || skip.has(parent) || ['link','linkReference','code','inlineCode'].includes(parent.type)) return;
      parent.children=parent.children.flatMap(node=>{
        if(node.type!=='text'){walk(node);return [node];}
        const out=[];let last=0;
        for(const match of node.value.matchAll(/\[(\d+)\]/g)) {
          const n=match[1]; if(!references.has(n)) throw new Error(`Undefined English reference ${n}`);
          if(match.index>last)out.push({type:'text',value:node.value.slice(last,match.index)});
          out.push({type:'link',url:`#news-ref-${n}`,children:[{type:'text',value:match[0]}],data:{hProperties:{'data-news-citation':n,'data-astro-reload':true,ariaLabel:`Go to reference ${n}`}}});
          last=match.index+match[0].length;
        }
        if(last<node.value.length)out.push({type:'text',value:node.value.slice(last)});
        return out.length?out:[node];
      });
    }
    walk(tree);
  };
}
