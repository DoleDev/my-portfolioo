const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../blog/posts');   // ← your actual folder
const outputFile = path.join(__dirname, '../data/blog.json');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function buildBlog() {
  if (!fs.existsSync(postsDir)) {
    console.log('❌ Folder blog/posts not found');
    return;
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  const posts = [];

  files.forEach(file => {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Skip drafts
    if (data.draft === true || data.draft === 'true') return;

    const id = data.id || slugify(data.title || file.replace('.md', ''));

    posts.push({
      id,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      category: data.category || 'general',
      tags: data.tags || [],
      readTime: data.reading_time || data.readTime || '5 min read',
      image: data.thumbnail || data.image || '',
      featured: data.featured || false,
      draft: false,
      order: data.order || 99,
      content: content.trim()
    });
  });

  // Newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(outputFile, JSON.stringify({ posts }, null, 2));
  console.log(`✅ Built ${posts.length} posts → data/blog.json`);
}

buildBlog();
