const MARKDOWN_LINK = /\[([^\]]*)\]\(([^)]*)\)/g;
const MAILTO = /mailto:/gi;
const EMPHASIS = /\*\*|__|~~|`+|\*/g;

function stripMarkdown(content) {
  return content
    .replace(MARKDOWN_LINK, '$1 $2')
    .replace(MAILTO, '')
    .replace(EMPHASIS, '');
}

module.exports = { stripMarkdown };
