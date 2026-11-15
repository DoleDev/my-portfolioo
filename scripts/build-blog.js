const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../blog/posts');
const outputFile = path.join(__dirname, '../data/blog.json');

// Simple frontmatter parser for markdown files
function parseFrontmatter(fileContent) {
    const match = fileContent.match(/^---\s*([\s\S]*?)\s*---([\s\S]*)$/);
    if (!match) return { metadata: {}, content: fileContent };

    const frontmatterLines = match[1].split('\n');
    const metadata = {};
    frontmatterLines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // Parse booleans
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            metadata[key] = value;
        }
    });

    return { metadata, content: match[2].trim() };
}

function buildBlogJson() {
    if (!fs.existsSync(postsDir)) {
        console.log('No blog/posts directory found.');
        return;
    }

    const files = fs.readdirSync(postsDir);
    const posts = [];

    files.forEach(file => {
        if (!file.endsWith('.md')) return;

        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { metadata, content } = parseFrontmatter(fileContent);

        const slug = file.replace(/\.md$/, '');

        posts.push({
            id: metadata.id || slug,
            title: metadata.title || 'Untitled Post',
            date: metadata.date || new Date().toISOString().split('T')[0],
            description: metadata.description || '',
            category: metadata.category || 'development',
            tags: metadata.tags || [],
            readTime: metadata.readTime || '5 min read',
            image: metadata.image || '',
            draft: metadata.draft === true,
            order: metadata.order || 99,
            content: content // Raw markdown or HTML body content
        });
    });

    // Sort by date or order
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const output = { posts };
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`Successfully generated blog.json with ${posts.length} posts!`);
}

buildBlogJson();
