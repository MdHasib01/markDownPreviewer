class MarkdownParser {
  // Heading parsing
  parseHeadings(text) {
    return text.replace(/^(#{1,6})\s(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content.trim()}</h${level}>`;
    });
  }

  // Bold and Italic parsing
  parseEmphasis(text) {
    // Bold (must come before italic)
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Italic
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_\n]+)_/g, "<em>$1</em>");

    return text;
  }

  // Link parsing
  parseLinks(text) {
    return text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  }

  // Unordered list parsing
  parseUnorderedLists(text) {
    const lines = text.split("\n");
    let inList = false;
    const processedLines = lines.map((line) => {
      if (/^-\s/.test(line)) {
        if (!inList) {
          inList = true;
          return "<ul>" + `<li>${line.replace(/^-\s/, "").trim()}</li>`;
        }
        return `<li>${line.replace(/^-\s/, "").trim()}</li>`;
      }
      if (inList) {
        inList = false;
        return "</ul>" + line;
      }
      return line;
    });

    // Close list if it's the last block
    if (inList) {
      processedLines.push("</ul>");
    }

    return processedLines.join("\n");
  }

  // Ordered list parsing
  parseOrderedLists(text) {
    const lines = text.split("\n");
    let inList = false;
    const processedLines = lines.map((line) => {
      if (/^\d+\.\s/.test(line)) {
        if (!inList) {
          inList = true;
          return "<ol>" + `<li>${line.replace(/^\d+\.\s/, "").trim()}</li>`;
        }
        return `<li>${line.replace(/^\d+\.\s/, "").trim()}</li>`;
      }
      if (inList) {
        inList = false;
        return "</ol>" + line;
      }
      return line;
    });

    // Close list if it's the last block
    if (inList) {
      processedLines.push("</ol>");
    }

    return processedLines.join("\n");
  }

  // Code block parsing
  parseCodeBlocks(text) {
    // Multi-line code blocks
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="${lang}">${this.escapeHtml(
        code.trim()
      )}</code></pre>`;
    });

    // Inline code
    text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");

    return text;
  }

  // HTML escape to prevent XSS
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Main parse method
  parse(text) {
    // Preserve newlines
    text = text.replace(/\n/g, "\n");

    // Order of parsing matters
    text = this.parseCodeBlocks(text);
    text = this.parseHeadings(text);
    text = this.parseLinks(text);
    text = this.parseOrderedLists(text);
    text = this.parseUnorderedLists(text);
    text = this.parseEmphasis(text);

    // Convert remaining newlines to line breaks
    text = text.replace(/\n/g, "<br>");

    return text;
  }
}

const input = document.getElementById("markdown-input");
const preview = document.getElementById("preview");
const parser = new MarkdownParser();

// Update preview in real-time
input.addEventListener("input", function () {
  preview.innerHTML = parser.parse(this.value);
});

// Copy content to clipboard
function copyToClipboard() {
  input.select();
  document.execCommand("copy");
  alert("Markdown copied to clipboard!");
}

// Clear editor
function clearEditor() {
  input.value = "";
  preview.innerHTML = "";
}

// Initial sample markdown
input.value = `# Welcome to Markdown Previewer!
\`\`\`javascript
// Code block example
function greet(name) {
    console.log(\`Hello, \${name}!\`);
}
\`\`\`
Inline code: \`const x = 10;\`
`;
// Trigger initial render
preview.innerHTML = parser.parse(input.value);
