/** Use each primary lecture slide's caption as a reader-facing section title. */
export default function robotLearningSlideHeadings() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? '';
    const chapter = filePath.match(/rl-robot-learning-ch(\d{2})-[^/\\]+\.mdx?$/);
    if (!chapter) return;

    tree.children = (tree.children ?? []).flatMap((node) => {
      if (node.type !== 'mdxJsxFlowElement' || node.name !== 'LectureSlide') return [node];
      const caption = node.attributes.find((attribute) => attribute.name === 'caption')?.value;
      const page = node.attributes.find((attribute) => attribute.name === 'page')?.value;
      const pageNumber = Number(typeof page === 'object' ? page?.value : page);
      if (typeof caption !== 'string' || !Number.isInteger(pageNumber) || pageNumber < 1) {
        return [node];
      }
      const heading = {
        type: 'heading',
        depth: Number(chapter[1]) >= 8 ? 3 : 2,
        children: [{ type: 'text', value: `P${String(pageNumber).padStart(3, '0')} · ${caption}` }],
      };
      return [heading, node];
    });
  };
}
