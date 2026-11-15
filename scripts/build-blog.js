const fs = require('fs');
const path = require('path');

console.log('🚀 Starting blog build...');

try {
  // Check if gray-matter is available
  const matter = require('gray-matter');
  console.log('✅ gray-matter loaded successfully');

  const postsDir = path.join(__dirname, '../blog/posts');
  const outputFile = path.join(__dirname, '../data/blog.json');

  console.log('Looking for posts in:', postsDir);

  if (!fs.existsSync(postsDir)) {
    console.error('❌ ERROR: Folder blog/posts does not exist!');
    console.log('Creating empty blog.json...');
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify({ posts: [] }, null, 2));
    process.exit(0);
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown files`);

  const posts = [];

  files.forEach(file => {
    try {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Skip drafts
      if (data.draft === true || data.draft === 'true') {
        console.log(`⏭ Skipping draft: ${file}`);
        return;
      }

      function slugify(text) {
        return text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

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

      console.log(`✅ Processed: ${file}`);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  });

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Ensure data folder exists
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  fs.writeFileSync(outputFile, JSON.stringify({ posts }, null, 2));
  console.log(`\n✅ Successfully built ${posts.length} posts → data/blog.json`);

} catch (err) {
  console.error('\n❌ BUILD FAILED:');
  console.error(err);
  process.exit(1);
}
