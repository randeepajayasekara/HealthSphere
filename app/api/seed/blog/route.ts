import { NextRequest, NextResponse } from 'next/server';
import { seedBlogData, clearBlogData } from '@/app/utils/seed-blog-data';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'seed') {
      await seedBlogData();
      return NextResponse.json({ 
        success: true, 
        message: 'Blog data seeded successfully' 
      });
    } else if (action === 'clear') {
      await clearBlogData();
      return NextResponse.json({ 
        success: true, 
        message: 'Blog data cleared successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid action. Use "seed" or "clear"' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Blog seeding error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error?.message || 'Failed to process blog data' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Blog seeding API endpoint. Use POST with action: "seed" or "clear"' 
  });
}
