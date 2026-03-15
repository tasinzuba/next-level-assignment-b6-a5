require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const bcrypt = require('bcryptjs');

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@movieportal.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@movieportal.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create sample movies
  const movies = [
    {
      title: 'The Dark Knight',
      synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      genre: ['Action', 'Crime', 'Drama'],
      releaseYear: 2008,
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      platform: ['Netflix', 'HBO Max'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      thumbnail: 'https://via.placeholder.com/300x450?text=The+Dark+Knight',
    },
    {
      title: 'Inception',
      synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      releaseYear: 2010,
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
      platform: ['Netflix', 'Amazon Prime'],
      priceType: 'FREE',
      streamingUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      thumbnail: 'https://via.placeholder.com/300x450?text=Inception',
    },
    {
      title: 'Interstellar',
      synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      genre: ['Adventure', 'Drama', 'Sci-Fi'],
      releaseYear: 2014,
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      platform: ['Paramount+', 'Netflix'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      thumbnail: 'https://via.placeholder.com/300x450?text=Interstellar',
    },
    {
      title: 'The Shawshank Redemption',
      synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      genre: ['Drama'],
      releaseYear: 1994,
      director: 'Frank Darabont',
      cast: ['Tim Robbins', 'Morgan Freeman'],
      platform: ['HBO Max', 'Amazon Prime'],
      priceType: 'FREE',
      streamingUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
      thumbnail: 'https://via.placeholder.com/300x450?text=Shawshank+Redemption',
    },
    {
      title: 'Avengers: Endgame',
      synopsis: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.',
      genre: ['Action', 'Adventure', 'Drama'],
      releaseYear: 2019,
      director: 'Anthony Russo, Joe Russo',
      cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
      platform: ['Disney+'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      thumbnail: 'https://via.placeholder.com/300x450?text=Avengers+Endgame',
    },
  ];

  for (const movie of movies) {
    await prisma.movie.upsert({
      where: { id: movie.title.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: movie,
    }).catch(() => prisma.movie.create({ data: movie }));
  }
  console.log('✅ Sample movies created');

  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Admin credentials:');
  console.log('  Email:    admin@movieportal.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
