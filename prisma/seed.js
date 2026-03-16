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
      thumbnail: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
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
      thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
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
      thumbnail: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
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
      thumbnail: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    },
    {
      title: 'Avengers: Endgame',
      synopsis: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      releaseYear: 2019,
      director: 'Anthony Russo, Joe Russo',
      cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
      platform: ['Disney+'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      thumbnail: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    },
    {
      title: 'The Godfather',
      synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      genre: ['Crime', 'Drama'],
      releaseYear: 1972,
      director: 'Francis Ford Coppola',
      cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
      platform: ['Paramount+', 'Amazon Prime'],
      priceType: 'FREE',
      streamingUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
      thumbnail: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLe1rjLS4mvJ.jpg',
    },
    {
      title: 'Pulp Fiction',
      synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      genre: ['Crime', 'Drama', 'Thriller'],
      releaseYear: 1994,
      director: 'Quentin Tarantino',
      cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
      platform: ['Netflix', 'Amazon Prime'],
      priceType: 'FREE',
      streamingUrl: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
      thumbnail: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    },
    {
      title: 'The Matrix',
      synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      genre: ['Action', 'Sci-Fi'],
      releaseYear: 1999,
      director: 'Lana Wachowski, Lilly Wachowski',
      cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
      platform: ['HBO Max', 'Netflix'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
      thumbnail: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    },
    {
      title: 'Forrest Gump',
      synopsis: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.',
      genre: ['Drama', 'Romance'],
      releaseYear: 1994,
      director: 'Robert Zemeckis',
      cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
      platform: ['Paramount+', 'Netflix'],
      priceType: 'FREE',
      streamingUrl: 'https://www.youtube.com/watch?v=bLvqoHBptjg',
      thumbnail: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    },
    {
      title: 'Joker',
      synopsis: 'A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain.',
      genre: ['Crime', 'Drama', 'Thriller'],
      releaseYear: 2019,
      director: 'Todd Phillips',
      cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz'],
      platform: ['HBO Max', 'Netflix'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
      thumbnail: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    },
    {
      title: 'Spider-Man: No Way Home',
      synopsis: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      releaseYear: 2021,
      director: 'Jon Watts',
      cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch'],
      platform: ['Netflix', 'Disney+'],
      priceType: 'PREMIUM',
      streamingUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
      thumbnail: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    },
    {
      title: 'Parasite',
      synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      genre: ['Comedy', 'Drama', 'Thriller'],
      releaseYear: 2019,
      director: 'Bong Joon-ho',
      cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
      platform: ['Hulu', 'Amazon Prime'],
      priceType: 'FREE',
      streamingUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
      thumbnail: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
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
