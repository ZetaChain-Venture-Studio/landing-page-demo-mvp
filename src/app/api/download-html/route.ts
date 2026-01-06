import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read the static HTML file
    const htmlPath = path.join(process.cwd(), 'static-export', 'index.html');
    const htmlContent = await readFile(htmlPath, 'utf-8');

    // Return as downloadable file
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="anuma-landing-page.html"',
      },
    });
  } catch (error) {
    console.error('Error reading HTML file:', error);
    return NextResponse.json(
      { error: 'Failed to read HTML file' },
      { status: 500 }
    );
  }
}
