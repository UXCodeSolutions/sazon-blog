const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cqqioxcxhgdfwbjrjsef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWlveGN4aGdkZndianJqc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjcxMTcsImV4cCI6MjA4ODg0MzExN30.B-oKK6aLvrcz5vfHVwcJitCPEq8bGbt9dMfTZolVnj8';
const supabase = createClient(supabaseUrl, supabaseKey);

const mockPosts = [
  {
    title: 'Master the Art of the Perfect Sear',
    category: 'Dinner',
    time: '45 mins',
    difficulty: 'Hard',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800'
  },
  {
    title: 'Classic Fluffy Pancakes',
    category: 'Breakfast',
    time: '20 mins',
    difficulty: 'Easy',
    rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1528207776546-32248a4c38e8?q=80&w=800'
  },
  {
    title: 'Garlic Butter Roasted Asparagus',
    category: 'Sides',
    time: '15 mins',
    difficulty: 'Easy',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800'
  },
  {
    title: 'Homemade Pasta from Scratch',
    category: 'Dinner',
    time: '1 hr',
    difficulty: 'Medium',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800'
  },
  {
    title: 'Spicy Avocado Toast',
    category: 'Breakfast',
    time: '5 mins',
    difficulty: 'Easy',
    rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=800'
  },
  {
    title: 'Creamy Mushroom Risotto',
    category: 'Dinner',
    time: '45 mins',
    difficulty: 'Medium',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db378?q=80&w=800'
  },
  {
    title: 'Roasted Garlic Mashed Potatoes',
    category: 'Sides',
    time: '40 mins',
    difficulty: 'Easy',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=800'
  },
  {
    title: 'Crispy Fried Chicken',
    category: 'Dinner',
    time: '1.5 hrs',
    difficulty: 'Hard',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800'
  },
  {
    title: 'Classic French Omelette',
    category: 'Breakfast',
    time: '10 mins',
    difficulty: 'Medium',
    rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1510693224855-fbc6b080b435?q=80&w=800'
  },
  {
    title: 'Lemon Herb Quinoa Salad',
    category: 'Sides',
    time: '25 mins',
    difficulty: 'Easy',
    rating_stars: '★★★★☆',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800'
  },
  {
    title: 'Slow Cooker Beef Stew',
    category: 'Dinner',
    time: '8 hrs',
    difficulty: 'Easy',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=800'
  },
  {
    title: 'Acai Smoothie Bowl',
    category: 'Breakfast',
    time: '10 mins',
    difficulty: 'Easy',
    rating_stars: '★★★★★',
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800'
  }
];

async function seed() {
  console.log('Inserting mock posts...');
  for (const post of mockPosts) {
    const { error } = await supabase.from('posts').insert([post]);
    if (error) {
      console.error('Error inserting post:', post.title, error.message);
    } else {
      console.log('Inserted:', post.title);
    }
  }
  console.log('Done!');
  process.exit(0);
}

seed();
